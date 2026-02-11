import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface LeadData {
  userEmail: string;
  scenarioId: string;
  simulationId: string;
  timestamp: string;
  inputs: {
    messagesPerDay: number;
    tokens: {
      input: number;
      output: number;
    };
    cacheRate: number;
    activePreset: string;
  };
  results: {
    winnerId: string;
    winnerName: string;
    savingsVsRunnerUp: number;
    annualProjectedCost: number;
    allModels: Array<{
      id: string;
      name: string;
      monthlyCost: number;
      valueScore: number;
    }>;
  };
  sensitivityAnalysis: {
    cost1x: number;
    cost2x: number;
    cost3x: number;
    annualCost1x: number;
    annualCost2x: number;
    annualCost3x: number;
  } | null;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, x-client-info, apikey',
      },
    });
  }

  try {
    const leadData: LeadData = await req.json();

    // Validate required fields
    if (!leadData.userEmail || !leadData.simulationId) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: userEmail, simulationId',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Save lead to database
    const { data: lead, error: dbError } = await supabase
      .from('enterprise_leads')
      .insert({
        email: leadData.userEmail,
        scenario_id: leadData.scenarioId,
        simulation_id: leadData.simulationId,
        messages_per_day: leadData.inputs.messagesPerDay,
        tokens_input: leadData.inputs.tokens.input,
        tokens_output: leadData.inputs.tokens.output,
        cache_hit_rate: leadData.inputs.cacheRate,
        active_preset: leadData.inputs.activePreset,
        winner_id: leadData.results.winnerId,
        winner_name: leadData.results.winnerName,
        winner_monthly_cost: leadData.results.allModels[0]?.monthlyCost || 0,
        savings_vs_runner_up: leadData.results.savingsVsRunnerUp,
        annual_projected_cost: leadData.results.annualProjectedCost,
        sensitivity_data: leadData.sensitivityAnalysis,
        all_models: leadData.results.allModels,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Check if it's a duplicate
      if (dbError.code === '23505') {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Lead already captured for this simulation',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }
      throw dbError;
    }

    // Send confirmation email via Resend
    const emailBody = {
      from: 'LLM Cost Engine <onboarding@resend.dev>',
      to: [leadData.userEmail],
      subject: '📊 Your Enterprise LLM Cost Report',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Your LLM Cost Analysis Report</h1>
          
          <p>Thank you for your interest in our Enterprise LLM Cost Analysis!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">Summary of Your Analysis</h2>
            <p><strong>Winner Model:</strong> ${leadData.results.winnerName}</p>
            <p><strong>Projected Annual Cost:</strong> $${leadData.results.annualProjectedCost.toLocaleString()}</p>
            <p><strong>Savings vs Runner-Up:</strong> ${leadData.results.savingsVsRunnerUp}%</p>
          </div>
          
          <p>You've already downloaded the PDF report. If you need a more detailed analysis or have questions about implementing this in your infrastructure, feel free to reply to this email.</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
            LLM Cost Engine - Open Source LLM Pricing Intelligence<br>
            <a href="https://llm-cost-engine.vercel.app" style="color: #4F46E5;">llm-cost-engine.vercel.app</a>
          </p>
        </div>
      `,
    };

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email send failed:', errorText);
      // Don't fail the request if email fails, lead is already saved
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enterprise lead captured successfully',
        leadId: lead.id,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Error processing lead:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process lead',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
