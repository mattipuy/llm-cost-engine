# Feature Spec: Competitive Price Alerts (MVP - PRODUCTION READY)

**Goal**: Build a "Surgical Trust" asset by capturing emails from users interested in **Competitive Pricing Intelligence**.

## 1. Database Schema (Supabase)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Alerts Table - Enhanced for Asset Quality
create table public.price_alerts (
  id uuid default uuid_generate_v4() primary key,
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
  verification_token text default encode(gen_random_bytes(32), 'hex'),
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
```

## 2. Infrastructure: Email & Edge Functions

**Provider**: **Resend** (Recommended for delivery & DX).

### Function A: `subscribe-to-alert`

Request:

```json
{
  "email": "user@example.com",
  "modelId": "gpt-4o",
  "currentStats": {
    "priceInput": 2.5,
    "monthlyCost": 125.0,
    "simulationHash": "..."
  },
  "honeypot": "" // Anti-Spam
}
```

Logic:

1.  **Rate Limit**: Check Upstash/Redis (Limit: 5 req/min per IP). Alternatively, use simple DB-based check (count recent unverified inserts).
2.  **Anti-Spam**: Verify honeypot is empty & email regex is valid.
3.  **Insert/Upsert**:
    - Use `upsert` on `(email, model_id)`.
    - If exists and verified: Return success (idempotent).
    - If exists and unverified: Refresh token & resend email.
4.  **Send Email via Resend**:
    - Subject: "Verify your Price Alert for [Model Name]"
    - Body: "Click here to confirm: https://llm-cost-engine.vercel.app/verify?token=[verification_token]"

### Function B: `verify-token`

Request: `{ "token": "xyz..." }`
Logic:

1.  Select from `price_alerts` where `verification_token = token` AND `token_expires_at > now()`.
2.  If not found/expired: Return `400 Invalid Token`.
3.  Update: `verified = true`, `verification_token = null`.
4.  Return `200 Success`.

### Function C: `check-price-shifts` (Scheduled Cron - Weekly)

**Trigger**: Every Sunday at 09:00 UTC (via GitHub Action or Supabase Cron).
**Competitor Definition (MVP)**:
Use a hardcoded mapping in the Code to define relevant competitors. Do NOT compare disjoint classes (e.g. GPT-4 vs Haiku).

```typescript
const COMPETITORS = {
  "gpt-4o": ["claude-3.5-sonnet", "gemini-1.5-pro", "mistral-large"],
  "claude-3.5-sonnet": ["gpt-4o", "gemini-1.5-pro"],
  "gemini-1.5-pro": ["gpt-4o", "claude-3.5-sonnet"],
  // ... define for other frontier models
};
```

Logic:

1.  Fetch latest `llm-pricing.json`.
2.  Select all `verified` alerts.
3.  Loop & Compare:
    - **Self Drop**: If `current_price < base_price * (1 - threshold)` -> ALERT.
    - **Competitor Drop**: If `competitor_price < current_price * (1 - threshold)` AND competitor is in `COMPETITORS[model_id]` -> ALERT.
4.  Send Batch Emails via Resend.
5.  Update `base_price_input` to new lower price (avoid spamming same drop).

## 3. Angular Implementation (`PriceAlertService`)

Dependencies: `@supabase/supabase-js`.

```typescript
export interface PriceAlertStats {
  priceInput: number;
  monthlyCost: number;
  simulationHash: string;
}

@Injectable({ providedIn: "root" })
export class PriceAlertService {
  private supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

  async subscribe(email: string, modelId: string, stats: PriceAlertStats, honeypot: string): Promise<{ error: any }> {
    // 1. Frontend Validation
    if (honeypot) return { error: null }; // Silent fail to fool bot

    // 2. Call Edge Function (Secure)
    const { data, error } = await this.supabase.functions.invoke("subscribe-to-alert", {
      body: { email, modelId, currentStats: stats },
    });
    return { error };
  }

  async verify(token: string): Promise<{ error: any }> {
    const { data, error } = await this.supabase.functions.invoke("verify-token", {
      body: { token },
    });
    return { error };
  }
}
```

## 4. UI Components

### Modal UX

- **State Idle**: Form (Email input).
- **State Loading**: Spinner "Securing your alert...".
- **State Success**: "Check your email! We sent a verification link." (Effect: Close modal after 3s).
- **State Error**: "Something went wrong. Please try again."

### Page: `/verify` (Angular Route)

- **Path**: `src/app/pages/verify/verify.component.ts` (Standalone).
- **Logic**:
  - `ngOnInit`: Get `token` from query param. Call `service.verify(token)`.
  - Show `LoadingComponent`.
  - **Success**: "✅ Alert Verified! You'll receive strategic updates." -> Link to "Back to Calculator".
  - **Error**: "❌ Token expired or invalid." -> **Link: "Back to Calculator" (Restart Flow)**. Do not ask to re-enter email here.

## 5. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used in Edge Functions.
- [ ] RLS policies prevent public `SELECT`/`UPDATE` on `price_alerts`.
- [ ] `honeypot` field filtered at Frontend service level (not sent to backend logic, or ignored).
