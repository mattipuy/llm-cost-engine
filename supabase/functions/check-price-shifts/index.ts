import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * check-price-shifts Edge Function
 *
 * Called by GitHub Actions after the weekly price snapshot.
 * Receives detected price drops, queries verified alerts, sends digest emails.
 *
 * Authorization: Bearer SERVICE_ROLE_KEY (only callable by cron)
 */

interface PriceDrop {
  modelId: string;
  modelName: string;
  provider: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  field: string;
}

interface AlertRow {
  id: string;
  email: string;
  model_id: string;
  unsubscribe_token: string | null;
}

interface DigestEntry {
  email: string;
  drops: PriceDrop[];
  unsubscribeToken: string | null;
}

const BASE_URL = 'https://llm-cost-engine.com';

serve(async (req: Request) => {
  try {
    // Verify authorization (Service Role only)
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { drops } = (await req.json()) as { drops: PriceDrop[] };

    if (!drops || drops.length === 0) {
      return new Response(
        JSON.stringify({
          drops_detected: 0,
          emails_sent: 0,
          errors: 0,
          message: 'No shifts',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
    );

    // Query verified alerts for affected models
    const affectedModelIds = [...new Set(drops.map((d) => d.modelId))];

    const { data: alerts, error: queryError } = await supabase
      .from('price_alerts')
      .select('id, email, model_id, unsubscribe_token')
      .in('model_id', affectedModelIds)
      .eq('verified', true);

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({
          error: 'Failed to query alerts',
          details: queryError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({
          drops_detected: drops.length,
          emails_sent: 0,
          errors: 0,
          message: 'No subscribers for affected models',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Group by email: 1 digest per user
    const digestMap = new Map<string, DigestEntry>();

    for (const alert of alerts as AlertRow[]) {
      const modelDrops = drops.filter((d) => d.modelId === alert.model_id);
      if (modelDrops.length === 0) continue;

      if (!digestMap.has(alert.email)) {
        digestMap.set(alert.email, {
          email: alert.email,
          drops: [],
          unsubscribeToken: alert.unsubscribe_token,
        });
      }

      const digest = digestMap.get(alert.email)!;
      for (const drop of modelDrops) {
        // Avoid duplicates if user has multiple alerts for same model
        if (
          !digest.drops.find(
            (d) => d.modelId === drop.modelId && d.field === drop.field,
          )
        ) {
          digest.drops.push(drop);
        }
      }
      // Use latest unsubscribe token
      if (alert.unsubscribe_token) {
        digest.unsubscribeToken = alert.unsubscribe_token;
      }
    }

    // Send digest emails via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    let emailsSent = 0;
    let errors = 0;

    for (const digest of digestMap.values()) {
      try {
        const modelNames = digest.drops.map((d) => d.modelName || d.modelId);
        const uniqueNames = [...new Set(modelNames)];
        const subject =
          uniqueNames.length === 1
            ? `Price Drop: ${uniqueNames[0]} is now cheaper`
            : `Price Drop Alert: ${uniqueNames.length} models dropped`;

        const html = renderDigestEmail(digest);
        const text = renderDigestEmailText(digest);

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LLM Cost Engine <alerts@mail.llm-cost-engine.com>',
            to: [digest.email],
            subject,
            html,
            text,
          }),
        });

        if (res.ok) {
          emailsSent++;
        } else {
          const errBody = await res.text();
          console.error(`Resend error for ${digest.email}:`, errBody);
          errors++;
        }
      } catch (sendErr) {
        console.error(`Send error for ${digest.email}:`, sendErr);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        drops_detected: drops.length,
        subscribers_matched: digestMap.size,
        emails_sent: emailsSent,
        errors,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('check-price-shifts error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Renders a plain text digest email for a single user.
 */
function renderDigestEmailText(digest: DigestEntry): string {
  const rows = digest.drops
    .map((d) => {
      const arrow = d.changePercent < 0 ? '↓' : '↑';
      const sign = d.changePercent < 0 ? '' : '+';
      const fieldLabel = d.field === 'input_1m' ? 'Input' : 'Output';
      return `${arrow} ${d.modelName || d.modelId} (${fieldLabel}): $${d.oldPrice} → $${d.newPrice} (${sign}${d.changePercent.toFixed(1)}%)`;
    })
    .join('\n');

  const unsubLink = digest.unsubscribeToken
    ? `${BASE_URL}/unsubscribe?token=${digest.unsubscribeToken}`
    : `${BASE_URL}`;

  return `LLM Price Drop Alert

We detected price changes on models you're tracking:

${rows}

Recalculate Your TCO:
${BASE_URL}/tools/chatbot-simulator

---
LLM Cost Engine · Deterministic TCO Analysis
Unsubscribe: ${unsubLink}`;
}

/**
 * Renders an HTML digest email for a single user.
 */
function renderDigestEmail(digest: DigestEntry): string {
  const rows = digest.drops
    .map((d) => {
      const arrow = d.changePercent < 0 ? '📉' : '📈';
      const color = d.changePercent < 0 ? '#16a34a' : '#dc2626';
      const sign = d.changePercent < 0 ? '' : '+';
      const fieldLabel = d.field === 'input_1m' ? 'Input' : 'Output';
      return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${arrow} ${d.modelName || d.modelId}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${fieldLabel}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-decoration:line-through;color:#9ca3af;">$${d.oldPrice}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">$${d.newPrice}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${color};font-weight:bold;">${sign}${d.changePercent.toFixed(1)}%</td>
      </tr>`;
    })
    .join('');

  const unsubLink = digest.unsubscribeToken
    ? `${BASE_URL}/unsubscribe?token=${digest.unsubscribeToken}`
    : `${BASE_URL}`;

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#111827;">LLM Price Drop Alert</h2>
      <p style="color:#4b5563;">We detected price changes on models you're tracking:</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Model</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Type</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Was</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Now</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">Change</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <p>
        <a href="${BASE_URL}/tools/chatbot-simulator"
          style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-weight:500;">
          Recalculate Your TCO
        </a>
      </p>

      <p style="color:#9ca3af;font-size:11px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">
        LLM Cost Engine · Deterministic TCO Analysis<br>
        <a href="${unsubLink}" style="color:#9ca3af;">Unsubscribe from price alerts</a>
      </p>
    </div>
  `;
}
