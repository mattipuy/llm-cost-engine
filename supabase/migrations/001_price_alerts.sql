-- Enable pgcrypto extension for gen_random_bytes()
create extension if not exists "pgcrypto";

-- Alerts Table - Enhanced for Asset Quality
create table public.price_alerts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  model_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Price Intelligence Fields
  base_price_input numeric,        -- Price at time of subscription
  base_monthly_cost numeric,       -- Total estimated monthly cost (Snapshot)
  simulation_hash text,            -- JSON string of {m, ti, to, active_models} for analytics

  -- Alert Configuration
  threshold_percentage numeric default 15, -- Notify if competitor undercuts by >= 15%
  alert_type text default 'competitive',   -- 'drop' or 'competitive'

  -- Verification & Security (Double Opt-In)
  verified boolean default false,
  verification_token text default replace(gen_random_uuid()::text, '-', ''),
  token_expires_at timestamp with time zone default (now() + interval '24 hours'),

  -- Prevent duplicate subscriptions for same user/model
  unique(email, model_id)
);

-- RLS Policies
alter table public.price_alerts enable row level security;

-- Deny all for anon (Prevent direct insert/select)
create policy "Deny all for anon"
on public.price_alerts
for all
to anon
using (false);

-- Only Service Role can bypass RLS (used by Edge Functions)
