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
