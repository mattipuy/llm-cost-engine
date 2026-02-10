# Implementation Plan: Competitive Price Alerts (MVP)

**Spec**: `docs/specs/04-price-alerts.md`
**Date**: 2026-02-08
**Status**: Draft 3 (Final)

---

## Pre-Implementation Summary

### Codebase Findings
- **No `src/environments/environment.ts`** — only `.gitkeep`. Must create environment files for Supabase config.
- **No `@supabase/supabase-js`** in `package.json` — needs `npm install`.
- **No existing modal/dialog pattern** — must build from scratch as standalone component.
- **Chatbot simulator component is ~1400 lines TS + ~1366 lines HTML** — adding modal logic directly would bloat it. Use a separate standalone component with `@Input`/`@Output`.
- **Pattern**: Standalone components, Angular Signals, OnPush change detection, lazy-loaded routes.
- **Services barrel**: `src/app/core/services/index.ts` — add new service here.
- **Vercel deploy**: `vercel.json` uses `fra1` region, no Edge Functions configured yet.
- **Weekly snapshots**: `.github/workflows/price-snapshot.yml` already runs Sundays at 00:00 UTC.

### Dependencies to Install
- `@supabase/supabase-js` (Angular frontend → Edge Functions)
- No Resend SDK needed on frontend (Resend is called from Edge Functions only)

### Files to Create (9)
1. `src/environments/environment.ts` — dev config
2. `src/environments/environment.prod.ts` — prod config (Supabase URL + anon key)
3. `src/app/core/services/price-alert.service.ts` — PriceAlertService
4. `src/app/shared/components/price-alert-modal/price-alert-modal.component.ts` — Modal standalone component
5. `src/app/shared/components/price-alert-modal/price-alert-modal.component.html` — Modal template
6. `src/app/pages/verify/verify.component.ts` — Verification page (standalone, lazy-loaded)
7. `supabase/functions/subscribe-to-alert/index.ts` — Edge Function A
8. `supabase/functions/verify-token/index.ts` — Edge Function B
9. `supabase/migrations/001_price_alerts.sql` — DB migration

### Files to Modify (4)
1. `src/app/app.routes.ts` — add `/verify` route
2. `src/app/engines/chatbot-simulator/chatbot-simulator.component.ts` — inject service, add modal signal
3. `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` — add bell icons + Winner CTA
4. `src/app/core/services/index.ts` — export new service
5. `package.json` — add `@supabase/supabase-js`

---

## Implementation Phases

### Phase 1: Infrastructure Setup
**Goal**: Install deps, create environment files, set up Supabase project.

**Steps**:
1. `npm install @supabase/supabase-js`
2. Create `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'http://localhost:54321',
     supabaseKey: 'local-anon-key'
   };
   ```
3. Create `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     supabaseUrl: 'PLACEHOLDER_URL',
     supabaseKey: 'PLACEHOLDER_ANON_KEY'
   };
   ```
4. Create `supabase/migrations/001_price_alerts.sql` with the full schema from spec section 1.

**Verification**:
- [ ] `npm run build` still passes
- [ ] Environment files are in `.gitignore` for prod keys (or use Vercel env vars)

---

### Phase 2: PriceAlertService
**Goal**: Create the Angular service that talks to Supabase Edge Functions.

**File**: `src/app/core/services/price-alert.service.ts`

**Key decisions**:
- Use `inject()` pattern (consistent with codebase — see `chatbot-simulator.component.ts` line 559+)
- Typed interface `PriceAlertStats` (from spec section 3)
- Return `{ success: boolean; error?: string }` instead of raw Supabase error
- Filter honeypot client-side (never send to backend)
- `isPlatformBrowser` guard: don't call Supabase during SSR

**Interface**:
```typescript
export interface PriceAlertStats {
  priceInput: number;      // $/1M tokens input price
  monthlyCost: number;     // Total estimated monthly cost
  simulationHash: string;  // JSON of {m, ti, to, selectedModels}
}

export interface PriceAlertResult {
  success: boolean;
  error?: string;
}
```

**Methods**:
- `subscribe(email: string, modelId: string, stats: PriceAlertStats): Promise<PriceAlertResult>`
- `verify(token: string): Promise<PriceAlertResult>`

**Verification**:
- [ ] Service compiles with strict TypeScript
- [ ] Exported in `core/services/index.ts`
- [ ] No Supabase calls during SSR

---

### Phase 3: Price Alert Modal Component
**Goal**: Standalone modal component with 4 UX states (Idle, Loading, Success, Error).

**File**: `src/app/shared/components/price-alert-modal/price-alert-modal.component.ts`

**Inputs**:
- `modelId: string` — which model to track
- `modelName: string` — display name
- `currentPriceInput: number` — current $/1M tokens
- `currentMonthlyCost: number` — current monthly TCO
- `isOpen: boolean` — visibility toggle

**Outputs**:
- `closed: EventEmitter<void>` — when modal is dismissed

**Signals (internal)**:
- `email = signal('')`
- `honeypot = signal('')` — hidden field
- `state = signal<'idle' | 'loading' | 'success' | 'error'>('idle')`
- `isEmailValid = computed(...)` — regex validation
- `simulationHash` — computed from current URL params (m, ti, to)

**UX States** (from spec section 4):
- **Idle**: Form with email input, hidden honeypot, submit button
- **Loading**: Spinner + "Securing your alert..."
- **Success**: "Check your email!" + auto-close after 3s
- **Error**: "Something went wrong." + retry button

**Design**:
- Overlay backdrop (click outside = close)
- Escape key = close
- Tailwind classes consistent with existing card/button styles
- Accessible: `role="dialog"`, `aria-modal="true"`, focus trap

**Verification**:
- [ ] Modal opens/closes correctly
- [ ] Honeypot field is invisible but present in DOM
- [ ] Email validation matches spec regex
- [ ] All 4 states render correctly
- [ ] SSR-safe (no DOM access during server render)

---

### Phase 4: Integration into Chatbot Simulator
**Goal**: Add bell icons to model cards + Winner CTA.

**Changes to `chatbot-simulator.component.ts`**:
- Import `PriceAlertModalComponent`
- Add to `imports: [...]` array
- Add signals:
  ```typescript
  alertModalOpen = signal(false);
  alertModelId = signal<string | null>(null);
  alertModelName = signal('');
  alertPriceInput = signal(0);
  alertMonthlyCost = signal(0);
  ```
- Add method:
  ```typescript
  openPriceAlert(modelId: string, modelName: string, priceInput: number, monthlyCost: number): void {
    this.alertModelId.set(modelId);
    this.alertModelName.set(modelName);
    this.alertPriceInput.set(priceInput);
    this.alertMonthlyCost.set(monthlyCost);
    this.alertModalOpen.set(true);
  }
  closePriceAlert(): void {
    this.alertModalOpen.set(false);
  }
  ```

**Changes to `chatbot-simulator.component.html`**:

1. **Bell icon in model cards** (after model name, ~line 711):
   ```html
   <button type="button"
     (click)="openPriceAlert(result.modelId, result.modelName, ...)"
     class="ml-2 text-gray-400 hover:text-indigo-600 transition-colors"
     title="Track Competitive Price Shifts">
     <svg class="w-4 h-4"><!-- bell icon --></svg>
   </button>
   ```

2. **Winner CTA** (after winner card div, ~line 575):
   ```html
   <button type="button"
     (click)="openPriceAlert(winner.modelId, winner.modelName, ...)"
     class="text-sm text-amber-700 hover:text-amber-900">
     Track pricing shifts for {{ winner.modelName }}
   </button>
   ```

3. **Modal placement** (at bottom of template, before `</article>`):
   ```html
   @if (alertModalOpen()) {
     <app-price-alert-modal
       [modelId]="alertModelId()!"
       [modelName]="alertModelName()"
       [currentPriceInput]="alertPriceInput()"
       [currentMonthlyCost]="alertMonthlyCost()"
       [isOpen]="alertModalOpen()"
       (closed)="closePriceAlert()" />
   }
   ```

**Verification**:
- [ ] Bell icon visible on each model card
- [ ] Winner CTA visible below winner card
- [ ] Clicking bell opens modal with correct model pre-filled
- [ ] Clicking Winner CTA opens modal with winner model
- [ ] Modal closes on backdrop click and Escape
- [ ] No CLS (bell icon doesn't shift layout)

---

### Phase 5: Verify Page (`/verify`)
**Goal**: Standalone page for email verification via token.

**File**: `src/app/pages/verify/verify.component.ts`

**Logic**:
- `ngOnInit`: Read `token` from `ActivatedRoute.queryParams`
- Call `PriceAlertService.verify(token)`
- Show loading → success or error state
- Success: "Alert Verified!" + link to `/tools/chatbot-simulator`
- Error: "Token expired or invalid." + link to `/tools/chatbot-simulator`

**Route** (add to `app.routes.ts`):
```typescript
{
  path: 'verify',
  loadComponent: () =>
    import('./pages/verify/verify.component').then(m => m.VerifyComponent),
  title: 'Verify Price Alert | LLM Cost Engine',
}
```

**Verification**:
- [ ] `/verify?token=abc` loads the component
- [ ] Valid token → success state
- [ ] Invalid/expired token → error state
- [ ] "Back to Calculator" link works
- [ ] SSR renders a loading state (no Supabase call server-side)

---

### Phase 6: Supabase Edge Functions (Backend)
**Goal**: Create the two Edge Functions for subscribe + verify.

> **Note**: This phase requires a Supabase project to be set up. The Edge Functions are deployed via `supabase functions deploy` and are NOT part of the Angular build. Environment variables (Resend API key, Service Role Key) are set in Supabase dashboard.

**Function A**: `supabase/functions/subscribe-to-alert/index.ts`
- Rate limit check (Upstash or DB-based count of recent unverified inserts)
- Honeypot + email regex validation
- Upsert on `(email, model_id)`:
  - Exists + verified → return success (idempotent)
  - Exists + unverified → refresh token, refresh expiry, resend email
  - New → insert + send email
- Send verification email via Resend

**Function B**: `supabase/functions/verify-token/index.ts`
- Select by `verification_token` where `token_expires_at > now()`
- Not found/expired → 400
- Found → set `verified = true`, `verification_token = null` → 200

**Verification**:
- [ ] Subscribe function returns 200 for valid email
- [ ] Subscribe function returns 200 (silent) for honeypot-filled requests
- [ ] Duplicate subscription refreshes token
- [ ] Verify function returns 200 for valid token
- [ ] Verify function returns 400 for expired token
- [ ] Verify function nullifies token after use (prevents reuse)

---

### Phase 7 (Future, NOT this PR): Cron - `check-price-shifts`
**Goal**: Weekly function that compares prices and sends alerts.

> Deferred: This requires accumulated verified subscribers + the COMPETITORS map. Implement after Phase 6 is live and has users.

---

## Edge Cases & Trade-offs

### EC-1: SSR Compatibility
Supabase client uses `fetch` which is available in Node.js 18+. However, we should NOT call Edge Functions during SSR (no user context). Guard all Supabase calls with `isPlatformBrowser()`.

### EC-2: Modal and Large Component
The chatbot-simulator component is already ~2800 lines total. The modal is a separate standalone component to avoid further bloat. Communication via `@Input`/`@Output` signals.

### EC-3: Environment Variables on Vercel
Supabase `ANON_KEY` is safe to expose client-side (it's designed for it, protected by RLS). Set via Vercel environment variables. Do NOT commit prod keys to git.

### EC-4: Email Validation Sync
Frontend uses same regex as Edge Function for immediate UX feedback. Server is the source of truth.

### EC-5: Duplicate `unique(email, model_id)` Conflict
Handled via upsert in Edge Function. Frontend shows success in all cases (idempotent) to avoid leaking whether an email exists.

### EC-6: Token Expiry UX
If user clicks verification link after 24h, they see "Token expired" + "Back to Calculator". Re-subscribing triggers upsert which refreshes the token and resends email.

---

## Success Criteria

- [ ] Bell icon on every model card triggers modal
- [ ] Winner CTA triggers modal pre-filled with winner
- [ ] Modal submit calls Edge Function (not direct DB insert)
- [ ] Double opt-in: email with verification link
- [ ] `/verify?token=X` page works correctly
- [ ] No regression on Lighthouse score (modal is lazy, no extra bundle on initial load)
- [ ] SSR still works (no browser-only APIs in server path)
- [ ] TypeScript strict mode passes
- [ ] `npm run build` succeeds
