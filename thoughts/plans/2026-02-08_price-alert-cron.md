# Implementation Plan: Price Alert Cron (Spec 08)

## Spec Reference
`docs/specs/08-price-alert-cron.md`

## Architecture Decision
**GitHub Actions triggers, Edge Function processes.**
The existing `price-snapshot.yml` already detects price changes weekly.
Instead of the Edge Function fetching external URLs, the GH Action passes detected drops
as payload to the Edge Function. This is simpler and has fewer failure points.

## Files to Create
1. `supabase/functions/check-price-shifts/index.ts` - Core cron function
2. `supabase/functions/unsubscribe/index.ts` - Unsubscribe handler
3. `supabase/migrations/002_unsubscribe_token.sql` - Add unsubscribe_token column
4. `src/app/pages/unsubscribe/unsubscribe.component.ts` - Unsubscribe page UI

## Files to Modify
1. `supabase/functions/subscribe-to-alert/index.ts` - Generate `unsubscribe_token` on insert
2. `.github/workflows/price-snapshot.yml` - Add step to call check-price-shifts with drops
3. `src/app/app.routes.ts` - Add `/unsubscribe` route

## Flow

### 1. Weekly Price Snapshot (existing, enhanced)
```
Sunday 00:00 UTC:
  GH Action → take snapshot → detect price_changes
  → if drops >= 5% found:
      POST /check-price-shifts with { drops: [...] }
      Authorization: Bearer SERVICE_ROLE_KEY
```

### 2. check-price-shifts Edge Function
```
Input: { drops: [{ modelId, oldPrice, newPrice, changePercent }] }

Steps:
1. Validate Authorization header (Service Role only)
2. For each drop, query verified alerts: SELECT email, model_id FROM price_alerts WHERE model_id IN (...) AND verified = true
3. Group alerts by email (1 digest per user)
4. For each digest:
   - Render HTML email with all drops for that user
   - Include unsubscribe link with unsubscribe_token
   - Send via Resend API
5. Return { drops_detected, emails_sent, errors }
```

### 3. Unsubscribe Flow
```
User clicks unsubscribe link in email
→ /unsubscribe?token=xxx
→ Page calls Edge Function POST /unsubscribe { token }
→ Function deletes row from price_alerts
→ Page shows "Successfully unsubscribed"
```

### 4. DB Changes
```sql
ALTER TABLE price_alerts ADD COLUMN unsubscribe_token text;
-- For existing rows, backfill with random tokens
UPDATE price_alerts SET unsubscribe_token = encode(gen_random_bytes(32), 'hex') WHERE unsubscribe_token IS NULL;
```

## Spec Improvements Integrated
- Threshold: 5% (spec), not 15% (original DB default, but spec 08 overrides)
- Digest: 1 email per user with all drops (not 1 per model)
- Unsubscribe: dedicated token + Edge Function + UI page
- Error handling: Resend failures logged, function continues (no single failure blocks all sends)
- Rate limit: Resend batch sending consideration (max ~100 emails/sec on free tier)

## Success Criteria
- [ ] Edge Function detects drops correctly
- [ ] Emails grouped as digest per user
- [ ] Unsubscribe link works end-to-end
- [ ] GH Action calls function after snapshot
- [ ] ng build passes
