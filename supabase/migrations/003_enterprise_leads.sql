-- Enterprise leads table for capturing report requests
create table public.enterprise_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  scenario_id text,
  simulation_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Simulation inputs (for context)
  messages_per_day integer,
  tokens_input integer,
  tokens_output integer,
  cache_hit_rate numeric,
  active_preset text,
  
  -- Results snapshot
  winner_id text,
  winner_name text,
  winner_monthly_cost numeric,
  savings_vs_runner_up numeric,
  annual_projected_cost numeric,
  
  -- Sensitivity analysis
  sensitivity_data jsonb,
  
  -- Full snapshot for analysis
  all_models jsonb,
  
  -- Prevent duplicate submissions (same email + simulation within 1 hour)
  unique(email, simulation_id)
);

-- RLS Policies
alter table public.enterprise_leads enable row level security;

-- Deny all for anon (Prevent direct insert/select)
create policy "Deny all for anon"
on public.enterprise_leads
for all
to anon
using (false);

-- Only Service Role can access (used by Edge Functions)
