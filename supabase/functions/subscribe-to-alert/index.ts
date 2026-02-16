import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, modelId, currentStats } = await req.json();

    // Anti-spam: email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Rate limit: count recent unverified inserts (DB-based)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('price_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('verified', false)
      .gte('created_at', fiveMinutesAgo);

    if ((count ?? 0) > 50) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Check if email is already verified for ANY model
    const { data: anyVerified } = await supabase
      .from('price_alerts')
      .select('id')
      .eq('email', email)
      .eq('verified', true)
      .limit(1)
      .maybeSingle();

    const isEmailVerified = !!anyVerified;

    // Check existing subscription for THIS model
    const { data: existing } = await supabase
      .from('price_alerts')
      .select('id, verified')
      .eq('email', email)
      .eq('model_id', modelId)
      .single();

    let verificationToken: string;

    if (existing) {
      if (existing.verified) {
        return new Response(
          JSON.stringify({
            message: 'Already subscribed and verified.',
            alreadySubscribed: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Unverified: refresh token and resend
      verificationToken =
        crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, '');
      const unsubToken =
        crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, '');
      await supabase
        .from('price_alerts')
        .update({
          verification_token: verificationToken,
          token_expires_at: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          base_price_input: currentStats?.priceInput ?? null,
          base_monthly_cost: currentStats?.monthlyCost ?? null,
          simulation_hash: currentStats?.simulationHash ?? null,
          unsubscribe_token: unsubToken,
        })
        .eq('id', existing.id);
    } else {
      // New subscription for this model
      const newUnsubToken =
        crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, '');

      if (isEmailVerified) {
        // Email already verified for other models → auto-verify this one
        const { error: insertError } = await supabase
          .from('price_alerts')
          .insert({
            email,
            model_id: modelId,
            base_price_input: currentStats?.priceInput ?? null,
            base_monthly_cost: currentStats?.monthlyCost ?? null,
            simulation_hash: currentStats?.simulationHash ?? null,
            verified: true,
            verification_token: null,
            token_expires_at: null,
            unsubscribe_token: newUnsubToken,
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to create subscription.' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        return new Response(
          JSON.stringify({
            message: 'Alert added successfully.',
            autoVerified: true
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Email NOT verified yet → need verification
      verificationToken =
        crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, '');

      const { error: insertError } = await supabase
        .from('price_alerts')
        .insert({
          email,
          model_id: modelId,
          base_price_input: currentStats?.priceInput ?? null,
          base_monthly_cost: currentStats?.monthlyCost ?? null,
          simulation_hash: currentStats?.simulationHash ?? null,
          verification_token: verificationToken,
          token_expires_at: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          unsubscribe_token: newUnsubToken,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription.' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
    }

    // Send verification email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const verifyUrl = `https://llm-cost-engine.com/verify?token=${verificationToken}`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LLM Cost Engine <alerts@mail.llm-cost-engine.com>',
          to: [email],
          subject: `Verify your Price Alert for ${modelId}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #4F46E5; margin-bottom: 24px;">Verify Your Price Alert</h1>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">You requested to track pricing shifts for <strong>${modelId}</strong>.</p>

              <div style="background: #F3F4F6; padding: 24px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 16px 0; color: #1F2937; font-size: 15px;">You'll receive strategic alerts when:</p>
                <ul style="margin: 0; padding-left: 20px; color: #4B5563;">
                  <li style="margin-bottom: 8px;">Price drops ≥5% on this model</li>
                  <li style="margin-bottom: 8px;">Competitor gets ≥15% cheaper (same category)</li>
                  <li>Context limits change materially</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #4F46E5; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Alert</a>
              </div>

              <p style="color: #9CA3AF; font-size: 13px; text-align: center;">This link expires in 24 hours</p>

              <p style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px; text-align: center;">
                LLM Cost Engine - Deterministic TCO Analysis<br>
                <a href="https://llm-cost-engine.com" style="color: #4F46E5; text-decoration: none;">llm-cost-engine.com</a>
              </p>
            </div>
          `,
          text: `Verify your Price Alert

You requested to track pricing shifts for ${modelId}.

Click the link below to confirm:
${verifyUrl}

This link expires in 24 hours.

---
LLM Cost Engine - Deterministic TCO Analysis
https://llm-cost-engine.com`,
          headers: {
            'List-Unsubscribe': '<https://llm-cost-engine.com/unsubscribe>',
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      });
    }

    return new Response(
      JSON.stringify({ message: 'Verification email sent.' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err) {
    console.error('Subscribe error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
