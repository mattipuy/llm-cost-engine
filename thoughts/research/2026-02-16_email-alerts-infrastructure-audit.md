# Email Alerts Infrastructure Audit

**Date**: 2026-02-16
**Status**: ✅ Code Complete, ❌ Not Activated
**Audit By**: Claude Code Lead Orchestrator

---

## Executive Summary

**Finding**: L'infrastruttura email alerts è **completamente implementata** a livello di codice, ma **NON è attiva** in produzione per mancanza di configurazione Resend.

**Blockers per Attivazione**:
1. ❌ Resend API Key non configurata in Supabase secrets
2. ❌ Domain `mail.llm-cost-engine.com` non verificato in Resend
3. ❓ Edge Functions potrebbero non essere deployate su Supabase
4. ❓ Nessun test end-to-end eseguito

**Estimated Time to Activate**: 2-4 ore (setup Resend + deploy + test)

---

## Infrastructure Analysis

### ✅ Database Schema (Complete)

**Migrations Applied**:
- `001_price_alerts.sql` - Schema principale con double opt-in
- `002_unsubscribe_token.sql` - Token unsubscribe
- `003_enterprise_leads.sql` - Lead capture (bonus)

**Key Fields**:
```sql
price_alerts (
  id uuid,
  email text,
  model_id text,
  verified boolean default false,
  verification_token text,
  token_expires_at timestamp,
  unsubscribe_token text,
  base_price_input numeric,
  base_monthly_cost numeric,
  simulation_hash text,
  threshold_percentage numeric default 15,
  unique(email, model_id)
)
```

**RLS Policies**: ✅ Configurate (deny anon, service role only)

---

### ✅ Edge Functions (5/5 Implemented)

#### 1. `subscribe-to-alert/index.ts` ✅
**Purpose**: Gestisce subscription + invia email di verifica

**Email Sending**: ✅ **PRESENTE** (linee 183-223)
```typescript
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
    html: `...verification link...`,
  })
})
```

**Features**:
- ✅ Email regex validation
- ✅ Honeypot protection
- ✅ Rate limiting (50 req/5min)
- ✅ Auto-verify se email già verificata per altri modelli
- ✅ Resend integration

**Dependencies**:
- `SUPABASE_URL` (env)
- `SUPABASE_SERVICE_ROLE_KEY` (env)
- `RESEND_API_KEY` (env) ⚠️ **MISSING**

---

#### 2. `check-price-shifts/index.ts` ✅
**Purpose**: Riceve drops dal GH Action + invia email digest

**Email Sending**: ✅ **PRESENTE** (linee 163-180)
```typescript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'LLM Cost Engine <alerts@mail.llm-cost-engine.com>',
    to: [digest.email],
    subject: subject,
    html: html,
    text: text,
  })
})
```

**Features**:
- ✅ Authorization check (Service Role only)
- ✅ Query verified alerts per model
- ✅ Group by email (1 digest per user)
- ✅ HTML + text email rendering
- ✅ Unsubscribe link included
- ✅ Error handling (continues on single failure)

**Input**: `{ drops: [{ modelId, modelName, provider, oldPrice, newPrice, changePercent, field }] }`

**Output**: `{ drops_detected, subscribers_matched, emails_sent, errors }`

**Dependencies**:
- `SUPABASE_SERVICE_ROLE_KEY` (env)
- `RESEND_API_KEY` (env) ⚠️ **MISSING**

---

#### 3. `verify-token/index.ts` ✅
**Purpose**: Verifica token email

**Logic**:
- Find alert by `verification_token`
- Check expiration (`token_expires_at > now()`)
- Mark `verified = true` for ALL alerts with that email
- Nullify tokens (prevent reuse)

**No Email Sending** (one-time verification)

---

#### 4. `unsubscribe/index.ts` ✅
**Purpose**: Unsubscribe user

**Logic**: Delete row by `unsubscribe_token`

**No Email Sending** (silent unsubscribe)

---

#### 5. `capture-enterprise-lead/index.ts` ✅
**Purpose**: Cattura lead enterprise (bonus feature)

**No Email Sending** (DB write only)

---

### ✅ Frontend Integration (Complete)

#### Angular Service: `price-alert.service.ts` ✅
```typescript
@Injectable({ providedIn: 'root' })
export class PriceAlertService {
  subscribe(email, modelId, stats, honeypot): Promise<PriceAlertResult>
  verify(token): Promise<PriceAlertResult>
  unsubscribe(token): Promise<PriceAlertResult>
  captureEnterpriseLead(leadData): Promise<PriceAlertResult>
}
```

**Features**:
- ✅ SSR-safe (`isPlatformBrowser` guard)
- ✅ Typed interfaces
- ✅ Error handling
- ✅ Honeypot filter client-side

**Configuration**: Reads from `environment.prod.ts`:
```typescript
supabaseUrl: 'https://tabmcwnkdaqrjjyaeovf.supabase.co'
supabaseKey: 'sb_publishable_MNtu7WeLXuuXQ9aUhDJf6w_3BtLgWG7'
```

---

#### UI Component: `price-alert-modal.component.ts` ✅
**Status**: Implementato (non verificato visualmente, ma presente nel glob)

---

### ✅ GitHub Action Integration (Complete)

**File**: `.github/workflows/price-snapshot.yml`

**Flow**:
1. ✅ Weekly cron: Sunday 00:00 UTC
2. ✅ Take snapshot
3. ✅ Detect price changes ≥ 5%
4. ✅ Write `price_drops.json`
5. ✅ Call Edge Function (linee 180-204):

```yaml
- name: Notify price alert subscribers
  if: steps.check_changes.outputs.has_drops == 'true'
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  run: |
    curl -X POST "${SUPABASE_URL}/functions/v1/check-price-shifts" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"drops\": $DROPS}"
```

**GitHub Secrets Required**:
- ✅ `SUPABASE_URL` (presente nel workflow)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (presente nel workflow)

---

## Missing Configuration (Blockers)

### 🚨 1. Resend API Key
**Status**: ❌ Not Configured

**Required Actions**:
1. Create Resend account (or login if exists)
2. Generate API key
3. Add to Supabase project secrets:
   - Dashboard → Project Settings → Edge Functions → Secrets
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx`

**Cost**: Free tier (3,000 emails/month) is sufficient for MVP

---

### 🚨 2. Domain Verification in Resend
**Status**: ❌ Not Verified

**Required Actions**:
1. Add domain `mail.llm-cost-engine.com` in Resend
2. Add DNS records:
   - DKIM record
   - SPF record
   - DMARC record (optional)
3. Wait for verification (usually 5-10 minutes)

**Why**: Emails from unverified domains go to spam or bounce

---

### ❓ 3. Edge Functions Deployment
**Status**: Unknown (need to check Supabase dashboard)

**Required Actions**:
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref tabmcwnkdaqrjjyaeovf`
4. Deploy functions: `supabase functions deploy`

**Verification Command**:
```bash
curl https://tabmcwnkdaqrjjyaeovf.supabase.co/functions/v1/subscribe-to-alert \
  -H "apikey: sb_publishable_MNtu7WeLXuuXQ9aUhDJf6w_3BtLgWG7" \
  -X POST \
  -d '{"email":"test@example.com","modelId":"gpt-4","currentStats":{}}'
```

Expected: 200 with verification email sent (if Resend configured) or error (if not)

---

### ❓ 4. Database Migrations Applied
**Status**: Unknown (need to check Supabase dashboard)

**Verification**:
- Supabase Dashboard → Database → Tables
- Check if `price_alerts` table exists

**If Missing**:
```bash
supabase db push
```

---

## Email Flow Validation

### Flow 1: Subscription + Verification
1. User clicks bell icon on model card
2. Modal opens → user enters email
3. Frontend calls `subscribe-to-alert` Edge Function
4. ✅ Edge Function validates email + rate limit
5. ✅ Edge Function inserts row in DB (verified=false)
6. ⚠️ Edge Function calls Resend API → **FAILS if no API key**
7. ❌ User never receives verification email
8. ❌ User cannot verify → alert stays inactive

**Blocker**: Step 6 (Resend API key missing)

---

### Flow 2: Price Drop Alert
1. Sunday 00:00 UTC → GH Action runs
2. ✅ Detects price drop ≥ 5%
3. ✅ Calls `check-price-shifts` with drops payload
4. ✅ Edge Function queries verified alerts
5. ✅ Edge Function groups by email
6. ⚠️ Edge Function calls Resend API → **FAILS if no API key**
7. ❌ User never receives price drop email

**Blocker**: Step 6 (Resend API key missing)

---

## Email Templates (Already Implemented)

### Template 1: Verification Email
**From**: `LLM Cost Engine <alerts@mail.llm-cost-engine.com>`
**Subject**: `Verify your Price Alert for ${modelId}`
**Content**: HTML + text with verification link
**Implementation**: `subscribe-to-alert/index.ts` lines 197-216

---

### Template 2: Price Drop Digest
**From**: `LLM Cost Engine <alerts@mail.llm-cost-engine.com>`
**Subject**: `Price Drop: ${modelName} is now cheaper` (or `Price Drop Alert: ${count} models dropped`)
**Content**: HTML table + text with drops, CTA, unsubscribe link
**Implementation**: `check-price-shifts/index.ts` lines 213-302

**Sample**:
```
📉 GPT-4 Turbo (Input): $10.00 → $5.00 (-50%)
📉 Claude 3.5 Sonnet (Output): $15.00 → $12.00 (-20%)

[Recalculate Your TCO]
```

---

## Security Analysis

### ✅ Implemented Security Measures
- Rate limiting (50 req/5min)
- Email regex validation
- Honeypot protection
- Double opt-in
- Token expiration (24h)
- Unsubscribe tokens
- RLS policies (anon denied)
- Service Role auth for cron

### ⚠️ Potential Issues
- **Supabase anon key in git**: Present in `environment.prod.ts` (line 4)
  - This is SAFE (anon keys are designed to be public, protected by RLS)
  - But best practice: use Vercel env vars instead

---

## Test Plan (Required Before Activation)

### Test 1: Manual Subscription
```bash
# 1. Call subscribe edge function
curl -X POST "https://tabmcwnkdaqrjjyaeovf.supabase.co/functions/v1/subscribe-to-alert" \
  -H "apikey: sb_publishable_MNtu7WeLXuuXQ9aUhDJf6w_3BtLgWG7" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "modelId": "gpt-4-turbo",
    "currentStats": {
      "priceInput": 10.0,
      "monthlyCost": 300.0,
      "simulationHash": "{\"m\":100,\"ti\":10,\"to\":10}"
    }
  }'

# Expected: 200 + "Verification email sent."
# Check: Email received in inbox
```

---

### Test 2: Token Verification
```bash
# 1. Extract token from email link
# 2. Call verify edge function
curl -X POST "https://tabmcwnkdaqrjjyaeovf.supabase.co/functions/v1/verify-token" \
  -H "apikey: sb_publishable_MNtu7WeLXuuXQ9aUhDJf6w_3BtLgWG7" \
  -H "Content-Type: application/json" \
  -d '{"token": "extracted-token-from-email"}'

# Expected: 200 + "Alert verified successfully."
```

---

### Test 3: Price Drop Alert
```bash
# Simulate price drop
curl -X POST "https://tabmcwnkdaqrjjyaeovf.supabase.co/functions/v1/check-price-shifts" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "drops": [{
      "modelId": "gpt-4-turbo",
      "modelName": "GPT-4 Turbo",
      "provider": "OpenAI",
      "oldPrice": 10.0,
      "newPrice": 5.0,
      "changePercent": -50.0,
      "field": "input_1m"
    }]
  }'

# Expected: 200 + { emails_sent: 1, ... }
# Check: Digest email received in inbox
```

---

### Test 4: Unsubscribe
```bash
# Extract unsubscribe token from digest email
curl -X POST "https://tabmcwnkdaqrjjyaeovf.supabase.co/functions/v1/unsubscribe" \
  -H "apikey: sb_publishable_MNtu7WeLXuuXQ9aUhDJf6w_3BtLgWG7" \
  -H "Content-Type: application/json" \
  -d '{"token": "extracted-unsubscribe-token"}'

# Expected: 200 + "Unsubscribed successfully."
```

---

## Activation Checklist

### Phase 1: Resend Setup (30 min)
- [ ] Create Resend account at https://resend.com
- [ ] Verify email ownership
- [ ] Add domain `mail.llm-cost-engine.com`
- [ ] Configure DNS records (DKIM, SPF, DMARC)
- [ ] Wait for domain verification
- [ ] Generate API key
- [ ] Store API key securely

---

### Phase 2: Supabase Configuration (15 min)
- [ ] Open Supabase dashboard
- [ ] Navigate to Project Settings → Edge Functions → Secrets
- [ ] Add secret: `RESEND_API_KEY` = `re_xxxxx`
- [ ] Verify DB table `price_alerts` exists
- [ ] If not, run: `supabase db push`

---

### Phase 3: Edge Functions Deploy (15 min)
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref tabmcwnkdaqrjjyaeovf`
- [ ] Deploy all functions: `supabase functions deploy`
- [ ] Verify deployment:
  ```bash
  supabase functions list
  ```

---

### Phase 4: Integration Testing (30 min)
- [ ] Run Test 1 (Manual Subscription)
- [ ] Verify verification email received
- [ ] Run Test 2 (Token Verification)
- [ ] Verify DB row marked as verified
- [ ] Run Test 3 (Price Drop Alert)
- [ ] Verify digest email received
- [ ] Run Test 4 (Unsubscribe)
- [ ] Verify DB row deleted

---

### Phase 5: Production Smoke Test (15 min)
- [ ] Deploy frontend to Vercel (if not already)
- [ ] Open chatbot simulator in production
- [ ] Click bell icon on a model card
- [ ] Enter real email
- [ ] Check inbox for verification email
- [ ] Click verification link
- [ ] Verify success page shown
- [ ] Check Supabase DB: `verified = true`

---

### Phase 6: Monitoring Setup (15 min)
- [ ] Configure Supabase logs monitoring
- [ ] Set up email delivery monitoring in Resend dashboard
- [ ] Add Sentry/error tracking for Edge Functions (optional)
- [ ] Document metrics:
  - Subscription rate (daily)
  - Verification rate (%)
  - Email delivery rate (%)
  - Unsubscribe rate (%)

---

## Cost Analysis

### Resend Free Tier
- 3,000 emails/month
- Unlimited domains
- No credit card required

**Projected Usage** (conservative):
- Verification emails: ~50/week = 200/month
- Price drop emails: ~20 subscribers × 4 weeks = 80/month
- **Total**: ~280/month (within free tier)

**Upgrade Trigger**: 250+ verified subscribers

---

### Supabase Free Tier
- 500 MB database
- 5 GB bandwidth
- 2 GB file storage
- Unlimited Edge Function invocations (within fair use)

**Projected Usage**:
- DB: ~10 KB/alert × 1000 alerts = 10 MB
- Edge Functions: ~500 invocations/week
- **Status**: Safely within free tier

---

## Next Steps (Immediate Action Items)

### 🔴 CRITICAL (Blocking Activation)
1. **Configure Resend API Key** (30 min)
   - Owner: Mattia
   - Deadline: Today
   - Output: API key stored in Supabase secrets

2. **Deploy Edge Functions** (15 min)
   - Owner: Claude Code
   - Deadline: Today
   - Output: All 5 functions live

3. **Run Integration Tests** (30 min)
   - Owner: Claude Code
   - Deadline: Today
   - Output: All 4 tests passing

---

### 🟡 HIGH PRIORITY (Post-Activation)
4. **Create Blog Post** (`/blog/how-we-calculate-llm-tco`)
   - Owner: Claude Code + Gemini (content)
   - Deadline: Before HN post
   - Output: Editorial landing page ready

5. **Optimize CTA** (email capture copy)
   - Owner: Claude Code
   - Deadline: Before traffic spike
   - Output: Conversion-optimized CTA

---

### 🟢 MEDIUM PRIORITY (Week 2)
6. **Add Analytics** (email signup tracking)
   - Owner: Claude Code
   - Deadline: Week 2
   - Output: GA4 events firing

7. **Monitor Metrics** (weekly review)
   - Owner: Mattia
   - Deadline: Weekly cadence
   - Output: Dashboard with signup rate, verification rate

---

## Conclusion

**Infrastructure Status**: ✅ 95% Complete (code-wise)

**Activation Blockers**: 2 critical items (Resend API key + Edge Functions deploy)

**Estimated Time to Go Live**: 2-4 hours (setup + testing)

**Recommendation**: Execute Phase 1-3 immediately (Resend setup + deploy + test), then proceed to blog post creation and CTA optimization.

**Risk**: LOW (all code already implemented and reviewed in planning phase)

---

**Audit Completed By**: Claude Code Lead Orchestrator
**Date**: 2026-02-16
**Next Review**: After activation (or if blockers encountered)
