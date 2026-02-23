import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find alert with this token (regardless of expiration or verification status)
    const { data: alert, error: findError } = await supabase
      .from('price_alerts')
      .select('id, email, verified, token_expires_at')
      .eq('verification_token', token)
      .single();

    if (findError || !alert) {
      return new Response(
        JSON.stringify({ error: 'Invalid token.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this email is already verified (via another token)
    const { data: alreadyVerified } = await supabase
      .from('price_alerts')
      .select('id')
      .eq('email', alert.email)
      .eq('verified', true)
      .limit(1)
      .maybeSingle();

    if (alreadyVerified) {
      return new Response(
        JSON.stringify({ message: 'Email already verified. All your alerts are active.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (!alert.token_expires_at || new Date(alert.token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token expired.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark verified ALL records with this email and nullify tokens
    const { error: updateError } = await supabase
      .from('price_alerts')
      .update({ verified: true, verification_token: null, token_expires_at: null })
      .eq('email', alert.email);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Verification failed.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all model IDs this email is now tracking (for welcome email)
    const { data: allAlerts } = await supabase
      .from('price_alerts')
      .select('model_id, unsubscribe_token')
      .eq('email', alert.email)
      .eq('verified', true);

    const trackedModels = (allAlerts ?? []).map((a: { model_id: string }) => a.model_id);
    const unsubToken = (allAlerts ?? [])[0]?.unsubscribe_token ?? '';

    // Send welcome email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && trackedModels.length > 0) {
      const modelList = trackedModels
        .map((m: string) => `<li style="margin-bottom:6px;color:#374151;">📊 <strong>${m}</strong></li>`)
        .join('');
      const unsubUrl = `https://llm-cost-engine.com/unsubscribe?token=${unsubToken}`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LLM Cost Engine <alerts@mail.llm-cost-engine.com>',
          to: [alert.email],
          subject: 'You\'re subscribed to LLM price alerts ✓',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5; margin-bottom: 8px;">You're in. 🎉</h1>
              <p style="color: #6B7280; font-size: 14px; margin-bottom: 24px;">Price alerts are active for your account.</p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                You'll be notified when any of these models has a significant pricing shift:
              </p>

              <ul style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px 16px 16px 32px; margin: 16px 0;">
                ${modelList}
              </ul>

              <div style="background: #EEF2FF; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #3730A3; font-weight: 600; font-size: 15px;">What triggers an alert?</p>
                <ul style="margin: 0; padding-left: 20px; color: #4338CA; font-size: 14px;">
                  <li style="margin-bottom: 6px;">Price drop ≥5% on a tracked model</li>
                  <li style="margin-bottom: 6px;">A competitor gets ≥15% cheaper in the same category</li>
                  <li>Context window changes that affect your workload</li>
                </ul>
              </div>

              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                We check prices every Sunday and send alerts only when something material changes.
                No noise, no weekly newsletters.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://llm-cost-engine.com/tools/chatbot-simulator"
                   style="display: inline-block; padding: 12px 28px; background: #4F46E5; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Run a TCO analysis →
                </a>
              </div>

              <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 13px; text-align: center;">
                LLM Cost Engine · Deterministic TCO Analysis<br>
                <a href="${unsubUrl}" style="color: #9CA3AF;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="https://llm-cost-engine.com" style="color: #9CA3AF;">llm-cost-engine.com</a>
              </p>
            </div>
          `,
          text: `You're subscribed to LLM price alerts.

Tracking: ${trackedModels.join(', ')}

What triggers an alert:
- Price drop ≥5% on a tracked model
- A competitor gets ≥15% cheaper in the same category
- Context window changes

We check prices every Sunday. No noise, alerts only when something material changes.

Run a TCO analysis: https://llm-cost-engine.com/tools/chatbot-simulator

---
Unsubscribe: ${unsubUrl}
LLM Cost Engine - https://llm-cost-engine.com`,
          headers: {
            'List-Unsubscribe': `<${unsubUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({ message: 'Alert verified successfully.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Verify error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
