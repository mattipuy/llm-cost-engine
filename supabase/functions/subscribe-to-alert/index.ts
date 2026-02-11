import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

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
    console.log('📧 subscribe-to-alert called:', { email, modelId });

    // Anti-spam: email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log('✅ Email validation passed');

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

    // Check existing subscription
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
          JSON.stringify({ message: 'Already subscribed and verified.' }),
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
      // New subscription
      console.log('📝 Creating new subscription');
      verificationToken =
        crypto.randomUUID().replace(/-/g, '') +
        crypto.randomUUID().replace(/-/g, '');
      const newUnsubToken =
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
        console.error('❌ Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription.' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
      console.log('✅ Subscription created successfully');
    }

    // Send verification email via Resend
    console.log('📨 Preparing to send email via Resend');
    console.log('🔑 RESEND_API_KEY configured:', RESEND_API_KEY ? 'YES' : 'NO');

    if (RESEND_API_KEY) {
      const verifyUrl = `https://llm-cost-engine.vercel.app/verify?token=${verificationToken}`;
      console.log('🔗 Verify URL:', verifyUrl);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LLM Cost Engine <onboarding@resend.dev>',
          to: [email],
          subject: `Verify your Price Alert for ${modelId}`,
          html: `
            <h2>Verify your Price Alert</h2>
            <p>You requested to track pricing shifts for <strong>${modelId}</strong>.</p>
            <p>Click below to confirm:</p>
            <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;">Verify Alert</a></p>
            <p style="color:#666;font-size:12px;">This link expires in 24 hours.</p>
            <p style="color:#999;font-size:11px;">LLM Cost Engine - Deterministic TCO Analysis</p>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', emailResponse.status, errorText);
        // Don't fail the request if email fails, subscription is already saved
      } else {
        console.log('Verification email sent successfully to:', email);
      }
    } else {
      console.error('RESEND_API_KEY not configured');
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
