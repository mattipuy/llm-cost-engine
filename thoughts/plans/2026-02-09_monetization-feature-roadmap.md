# Monetization Feature Roadmap

**Date**: 2026-02-09
**Agent**: Product Manager (Phase 2a Synthesis)
**Inputs**: 4 Phase 1 research documents (Trend, Competitive, Market, Business)
**Status**: DRAFT -- Pending Mattia approval

---

## Executive Summary

Four independent research agents analyzed the LLM Cost Engine monetization opportunity from different angles. Their findings converge on a clear strategy:

**Core thesis**: The open-source LLM shift does NOT undermine cost-comparison tools -- it makes them MORE valuable. Commoditization multiplies choices, and enterprises need neutral arbiters more than ever. Monetization should flow from authority, not from gating.

**Revenue model**: Premium Data Reports (PDF) + Newsletter Sponsorship + B2B Display Sponsorship + API Access. In that order.

**What NOT to do**: No Pro tier gating on the core calculator. No consulting CTAs. No undisclosed sponsorship. No affiliate links that could bias rankings.

**6-month target**: $3,000-5,000/mo recurring, at near-zero infrastructure cost (100% margin).

---

## Conflict Resolution (Where Agents Disagreed)

| Topic | Trend Analyst | Business Analyst | Resolution |
|-------|---------------|------------------|------------|
| Pro subscription tier | CONDITIONAL GO (data only, not calculator gating) | Ranked API Access #4 (7.2 score) | GO for API/data access as Phase C. NO-GO for gating any existing UI feature. The free calculator is the traffic engine; never gate it. |
| Affiliate links | Not addressed directly | Ranked #6 (5.4 score, trust-negative) | NO-GO. Trust cost outweighs revenue. Even "subtle" affiliate links invite suspicion of ranking bias. Revisit only if a provider offers a no-strings referral program with full disclosure. |
| Sponsored Model Highlights | Not addressed directly | Ranked #7 (4.5 score, trust-risky) | DEFER to Phase C evaluation. Only consider after brand authority is established AND with ironclad "Sponsored" labeling that is visually distinct from ValueScore ranking. |
| Newsletter timeline | Market Researcher says wait until 2K subs | Business Analyst says start at 1K subs | Start PREPARING the newsletter format at 1K subs (structure, cadence, branding). First sponsor outreach at 2K subs when open rates are proven. |

---

## Revenue Stream Ranking (Final Synthesis)

| Rank | Stream | Composite Score | Trust Impact | Time to Revenue | Phase |
|------|--------|:-:|:-:|:-:|:-:|
| 1 | **Premium Data Reports (PDF)** | 9.0 | +2 | Month 2 | A |
| 2 | **Newsletter Sponsorship** | 8.8 | +1 | Month 3 | A/B |
| 3 | **B2B Display Sponsorship** | 8.3 | +1 | Month 3-4 | B |
| 4 | **API Access (Pricing Data)** | 7.2 | +3 | Month 5-6 | C |
| 5 | **Data Licensing (Enterprise)** | 6.5 | +3 | Month 6+ | C |
| -- | ~~Affiliate Links~~ | 5.4 | -1 | -- | NO-GO |
| -- | ~~Sponsored Model Highlights~~ | 4.5 | -1 | -- | DEFER |
| -- | ~~White-Label Widget~~ | 3.8 | +2 | -- | DEFER |

---

## Phase A: Foundation (Months 1-2) -- "First Dollars"

**Revenue target**: $200-500/mo by end of Month 2
**Theme**: Build the revenue infrastructure on top of existing assets. No new traffic required -- monetize what we already have.

### Feature A1: Enhanced PDF Report (Premium Tier)

**1-line description**: Upgrade the existing email-gated Enterprise PDF to include historical price trends, market context, methodology notes, and a "Pricing Intelligence Summary" section -- then offer a premium version for $9-29 one-time purchase.

**How it makes money**: Two tiers of PDF export:
- **Free PDF**: Current functionality (basic cost breakdown, model comparison). Requires email. Drives subscriber growth.
- **Premium PDF** ($9-29): Adds historical price trend charts (from `price-history.json`), 90-day price forecast direction, per-model TCO sensitivity analysis, market context paragraph, and branded "LLM Cost Engine Intelligence Report" formatting. One-time purchase via Stripe Checkout (no subscription complexity).

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.ts` | MODIFY | Add "Download Premium Report" CTA alongside existing PDF export |
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` | MODIFY | UI for premium vs free PDF choice |
| `src/app/engines/chatbot-simulator/logic.service.ts` | MODIFY | Add `generatePremiumReportData()` method returning enriched dataset |
| `src/app/core/services/pdf-report.service.ts` | CREATE | Dedicated service for premium PDF generation (jsPDF + autotable, reuses existing patterns) |
| `src/app/core/services/stripe-checkout.service.ts` | CREATE | Minimal Stripe Checkout integration (redirect to hosted checkout page, no server needed) |
| `supabase/functions/create-checkout/index.ts` | CREATE | Edge Function: create Stripe Checkout Session, return URL |
| `supabase/functions/stripe-webhook/index.ts` | CREATE | Edge Function: listen for `checkout.session.completed`, generate signed download URL |
| `src/app/pages/download-report/download-report.component.ts` | CREATE | `/download-report?session_id=xxx` page (follows verify/unsubscribe pattern) |
| `src/app/app.routes.ts` | MODIFY | Add `/download-report` route |
| `src/app/core/services/index.ts` | MODIFY | Export new services |

**Implementation effort**: 30-40 hours
- Stripe Checkout integration: 12h (Edge Functions + client redirect)
- Premium PDF generation logic: 10h (extend existing jsPDF pattern)
- UI changes (CTA, download page): 8h
- Testing and polish: 5h

**Acceptance criteria**:
1. User sees "Download Free Report" and "Download Premium Report ($19)" buttons after running a calculation
2. Free PDF works exactly as today (email-gated, no payment)
3. Premium PDF clicking redirects to Stripe hosted checkout (no credit card form on our site)
4. After payment, user is redirected to `/download-report?session_id=xxx` which triggers PDF download
5. Premium PDF includes: all free content + historical price chart (last 12 weeks) + sensitivity analysis table + market context section + branded header/footer
6. Stripe webhook confirms payment before enabling download
7. No degradation of free PDF functionality
8. Mobile-responsive purchase flow

**Revenue model**: One-time purchases. At 3% conversion of calculator users to premium PDF:
- 2K MAU = ~60 purchases/mo = $1,140/mo at $19
- Realistic (conservative): $200-500/mo accounting for lower initial conversion

**Decision gates**:
- Gate 1: Stripe account approved and test mode working
- Gate 2: Premium PDF content visibly differentiated from free (user must feel they got value)
- Gate 3: At least 5 test purchases from real users before removing "beta" label

**Anti-patterns**:
- DO NOT degrade the free PDF to make premium look better
- DO NOT require account creation (Stripe handles identity)
- DO NOT show pricing before the user has seen their calculation results (value-first)
- DO NOT use dark patterns (pre-checked boxes, confusing upgrade flows)

---

### Feature A2: Newsletter Format + Infrastructure

**1-line description**: Transform the existing price alert digest email from a bare notification into a branded, sponsorable weekly newsletter called "The LLM Price Index."

**How it makes money**: Not directly in Phase A. This builds the asset (branded newsletter with consistent format, growing subscriber base, proven open rates) that will be monetized via sponsorship in Phase B.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/check-price-shifts/index.ts` | MODIFY | Rewrite email template to new branded format |
| `src/app/shared/components/price-alert-modal/price-alert-modal.component.ts` | MODIFY | Update copy to reference "The LLM Price Index" |
| `src/app/shared/components/price-alert-modal/price-alert-modal.component.html` | MODIFY | Update modal text and value proposition |
| `public/data/newsletter-config.json` | CREATE | Newsletter metadata (name, tagline, sponsor slot config) |
| `.github/workflows/price-snapshot.yml` | MODIFY | Update cron job to pass enriched data to email function |

**Implementation effort**: 12-16 hours
- Email template redesign (HTML): 6h
- Newsletter config and dynamic sponsor slot: 4h
- Modal copy updates: 2h
- Testing across email clients: 2h

**Acceptance criteria**:
1. Weekly email has branded header: "The LLM Price Index -- Week of [date]"
2. Email contains 3 sections: (a) Price Movements (existing), (b) Market Insight of the Week (1 paragraph, from `/insights` data), (c) Tool Spotlight (cross-link to one micro-tool)
3. Email has a clearly marked but empty "Sponsor" slot (placeholder text: "Want to reach [X] LLM decision-makers? Sponsor this newsletter" with mailto link)
4. Open rates tracked via Resend analytics
5. Unsubscribe flow works identically to current
6. Mobile-responsive email template
7. All price alert modals across 4 tools reference "The LLM Price Index" branding

**Revenue model**: No direct revenue in Phase A. Revenue begins in Phase B when first sponsor fills the slot.

**Decision gates**:
- Gate 1: Current subscriber count >= 1,000 (confirmed from orchestration doc: ~1,200 -- PASSED)
- Gate 2: Open rate baseline established (target: >= 35% after 4 branded sends)
- Gate 3: At least 2 sponsor inquiries received via the mailto link before actively selling

**Anti-patterns**:
- DO NOT increase email frequency beyond weekly (subscriber fatigue destroys open rates)
- DO NOT add promotional content without "Sponsored" label
- DO NOT auto-subscribe PDF purchasers (separate opt-in required)
- DO NOT send different content to free vs paid users (newsletter is the same for everyone)

---

### Feature A3: Sponsor Infrastructure (Technical)

**1-line description**: Build a lightweight, configurable sponsor slot system that can render "Sponsored by [Provider]" banners on any page, controlled by a JSON config file -- no code deploy needed to swap sponsors.

**How it makes money**: Enables Phase B and C sponsor revenue with zero-deploy sponsor rotation.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `public/data/sponsors.json` | CREATE | Sponsor config: `{ "active": true, "slots": { "calculator_footer": { "name": "...", "logo_url": "...", "link": "...", "label": "Sponsored" }, "newsletter": { ... }, "insights_banner": { ... } } }` |
| `src/app/shared/components/sponsor-banner/sponsor-banner.component.ts` | CREATE | Standalone component, reads sponsor config, renders banner. Follows price-alert-modal pattern. |
| `src/app/shared/components/sponsor-banner/sponsor-banner.component.html` | CREATE | Minimal UI: logo + "Sponsored by [Name]" + subtle link. Gray background, clearly differentiated from tool content |
| `src/app/core/services/sponsor.service.ts` | CREATE | Loads `sponsors.json`, provides sponsor data via Signals |
| `src/app/core/services/index.ts` | MODIFY | Export SponsorService |

**Implementation effort**: 8-12 hours
- Sponsor JSON schema design: 2h
- SponsorBannerComponent: 4h
- SponsorService with SSR TransferState: 3h
- Integration test across pages: 2h

**Acceptance criteria**:
1. `sponsors.json` controls all sponsor display -- no code changes needed to add/remove/swap sponsors
2. SponsorBannerComponent renders only when `active: true` AND a slot config exists for the current page
3. Banner is clearly labeled "Sponsored" in text visible without hover
4. Banner styling is visually distinct from tool content (gray background, border, smaller font)
5. Clicking the sponsor link opens in new tab with `rel="sponsored noopener"`
6. SSR-compatible (no CLS from sponsor loading)
7. When no sponsor is active, no empty space or layout shift
8. Analytics event fires when sponsor banner is viewed and when clicked

**Revenue model**: No direct revenue. This is infrastructure for Phase B.

**Decision gates**:
- Gate 1: Component renders correctly in SSR and client-side hydration
- Gate 2: Lighthouse score remains 95+ after integration
- Gate 3: Banner passes accessibility audit (contrast, alt text, link purpose)

**Anti-patterns**:
- DO NOT place sponsor above the fold on calculator pages (tool content comes first)
- DO NOT make sponsor banner visually similar to "Best Value" or ValueScore indicators
- DO NOT allow sponsor config to influence any calculation logic
- DO NOT track individual user clicks with PII (aggregate click counts only)

---

### Phase A Summary

| Feature | Effort | Revenue (Month 2) | Trust Impact |
|---------|--------|-------------------|--------------|
| A1: Premium PDF Report | 30-40h | $200-500/mo | +2 |
| A2: Newsletter Format | 12-16h | $0 (building asset) | +1 |
| A3: Sponsor Infrastructure | 8-12h | $0 (building infrastructure) | Neutral |
| **Total** | **50-68h** | **$200-500/mo** | **Positive** |

**Phase A exit criteria (all must be true to proceed to Phase B)**:
1. Premium PDF generating at least $100/mo in purchases
2. Newsletter open rate >= 35% over 4 consecutive sends
3. Subscriber count growing (net positive week-over-week)
4. Sponsor infrastructure deployed and tested with placeholder data
5. Zero negative user feedback about monetization changes
6. Lighthouse performance score >= 95 on all routes

---

## Phase B: Growth (Months 3-4) -- "Sustainable Income"

**Revenue target**: $1,000-2,000/mo by end of Month 4
**Theme**: Activate the sponsorship infrastructure built in Phase A. Land the first paid sponsors. Grow the subscriber base to make newsletter sponsorship more valuable.

### Feature B1: Newsletter Sponsorship (First Paid Sponsor)

**1-line description**: Fill the sponsor slot in "The LLM Price Index" newsletter with a paid sponsor, starting with inference platforms (Together AI, Fireworks, Groq) who have the highest developer marketing spend relative to their size.

**How it makes money**: Fixed monthly fee for "This week's LLM Price Index is presented by [Sponsor]" placement in weekly email. Pricing: $200-400/mo for 2K-3K subscribers (effectively $80-160 CPM -- premium but justified by audience quality).

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `public/data/sponsors.json` | MODIFY | Add real sponsor data to newsletter slot |
| `supabase/functions/check-price-shifts/index.ts` | MODIFY | Read newsletter sponsor from config, inject into email template |
| `docs/sponsor-kit/media-kit.md` | CREATE | One-page media kit: audience stats, open rates, subscriber demographics, pricing |

**Implementation effort**: 8-12 hours (mostly non-technical: outreach, media kit, negotiation)
- Media kit creation: 3h
- Email template sponsor integration: 3h
- Outreach to 10-15 target sponsors: 4h (ongoing)
- Contract/invoicing setup: 2h

**Sponsor outreach strategy** (priority order):
1. **Tier 1 targets** (most likely to say yes at current scale):
   - Helicone (LLM monitoring, $300-500/mo budget for niche dev placements)
   - LangSmith (LangChain monitoring, active in dev community)
   - Portkey AI (LLM gateway, actively sponsoring dev content)
2. **Tier 2 targets** (need 5K+ subscribers):
   - Together AI, Fireworks AI, Groq (inference platforms, bigger budgets)
   - Weights & Biases (ML monitoring, established dev marketing)
3. **Tier 3 targets** (need 10K+ subscribers):
   - AWS Bedrock, Azure AI, GCP Vertex AI (cloud providers, largest budgets)

**Outreach template**:
> Subject: Sponsoring "The LLM Price Index" -- reaching [X] LLM decision-makers weekly
>
> Hi [Name], I run LLM Cost Engine (llm-cost-engine.vercel.app), a free TCO calculator used by [X] developers weekly to compare LLM API pricing. Our weekly newsletter "The LLM Price Index" goes to [X] verified subscribers with [X]% open rates.
>
> I am opening a single sponsor slot -- one sponsor per issue, clearly labeled, premium placement. Would [Company] be interested? I have attached our media kit.

**Acceptance criteria**:
1. Media kit created with: subscriber count, open rate, audience description, sample email, pricing
2. First sponsor signed within 60 days of outreach start
3. Sponsor content is clearly labeled "Sponsored" and visually separated from editorial
4. Sponsor link tracked with UTM parameters (aggregate only, no PII)
5. Monthly sponsor invoice automated (Stripe or manual PayPal/wire for simplicity)

**Revenue model**: $200-400/mo per newsletter sponsor. One sponsor at a time (exclusivity premium).

**Decision gates**:
- Gate 1: Open rate >= 35% sustained (sponsor needs proof of engagement)
- Gate 2: Subscriber count >= 2,000 at time of outreach
- Gate 3: At least 3 sponsor conversations before signing (don't take the first offer)

**Anti-patterns**:
- DO NOT accept sponsors whose product is not relevant to the audience (no crypto, no unrelated SaaS)
- DO NOT allow sponsor to dictate editorial content ("write about us" requests = no)
- DO NOT increase email frequency to generate more sponsor impressions
- DO NOT share individual subscriber data with sponsors (aggregate stats only)

---

### Feature B2: B2B Display Sponsorship (Site Banner)

**1-line description**: Activate the sponsor banner component (built in Phase A3) on the `/insights` page and calculator results sections, with a paying sponsor.

**How it makes money**: Fixed monthly fee for "Sponsored by [Provider]" banner displayed on high-traffic pages. Pricing: $300-800/mo depending on traffic and placement.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `public/data/sponsors.json` | MODIFY | Add display sponsor config for `insights_banner` and `calculator_footer` slots |
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` | MODIFY | Add `<app-sponsor-banner slot="calculator_footer">` below results section |
| `src/app/pages/insights/insights.component.html` | MODIFY | Add `<app-sponsor-banner slot="insights_banner">` in sidebar or header area |
| `docs/sponsor-kit/media-kit.md` | MODIFY | Add display sponsorship option with traffic data, impression estimates |

**Implementation effort**: 6-10 hours
- Banner integration into 2 pages: 3h
- Media kit update with display options: 2h
- Impression tracking (analytics events): 2h
- A/B test banner placement: 2h

**Acceptance criteria**:
1. Sponsor banner renders on `/insights` page (above fold, but below main headline)
2. Sponsor banner renders on chatbot simulator (below results, above FAQ)
3. Banner is labeled "Sponsored" and visually distinct
4. Impression and click counts tracked in analytics (aggregate)
5. No CLS caused by banner loading
6. Banner does not appear on mobile if it degrades UX (configurable per slot)

**Revenue model**: $300-800/mo for display sponsorship (bundle with newsletter for higher total).

**Decision gates**:
- Gate 1: Site traffic >= 5K MAU (sponsors need meaningful impressions)
- Gate 2: Sponsor banner component tested and live with placeholder for >= 2 weeks
- Gate 3: At least one newsletter sponsor already signed (proves ability to sell)

**Anti-patterns**:
- DO NOT place banner inside the calculation results area (must be clearly separate from tool output)
- DO NOT use animated banners or attention-grabbing designs (subtle = professional)
- DO NOT sell more than 2 display slots simultaneously (clutter destroys credibility)

---

### Feature B3: Subscriber Growth Engine

**1-line description**: Implement 3 low-effort growth tactics to push subscriber count from ~1,200 to 3,000-5,000 in 2 months, making sponsorship more valuable.

**How it makes money**: Indirectly -- larger subscriber base commands higher sponsor fees and better conversion on premium PDFs.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` | MODIFY | Add inline newsletter CTA in winner card area ("Get weekly price alerts for [winning model]") |
| `src/app/engines/caching-roi/caching-roi.component.html` | MODIFY | Add newsletter CTA after results |
| `src/app/engines/context-window/context-window.component.html` | MODIFY | Add newsletter CTA after results |
| `src/app/engines/batch-api/batch-api.component.html` | MODIFY | Add newsletter CTA after results |
| `src/app/shared/components/inline-subscribe-cta/inline-subscribe-cta.component.ts` | CREATE | Reusable inline CTA component (not modal -- embedded in page flow) |

Growth tactics:
1. **Inline CTA in results**: After every calculation, show "Get notified when [winning model] drops in price" with email input inline (not modal). Friction-free, context-relevant.
2. **Content distribution**: Post weekly price change summaries on Reddit r/LocalLLaMA, r/MachineLearning, Hacker News (manual but high-ROI). Link back to tools + newsletter.
3. **Cross-promotion in PDF**: Free and premium PDFs include footer: "Subscribe to The LLM Price Index for weekly price intelligence."

**Implementation effort**: 10-14 hours
- Inline CTA component: 6h
- Integration into 4 tool templates: 4h
- PDF footer update: 2h
- Reddit/HN post templates: 2h

**Acceptance criteria**:
1. Inline CTA appears below results on all 4 tools
2. CTA pre-fills with the winning model name ("Get alerts for GPT-4o-mini")
3. Subscribe flow uses existing price-alert infrastructure (Supabase, double opt-in)
4. No duplicate subscription if user already subscribed
5. Subscriber count increases by >= 50% within 8 weeks of launch
6. Newsletter CTA conversion rate >= 3% of calculator users

**Revenue model**: No direct revenue. Multiplier for B1 and B2 revenue.

**Decision gates**:
- Gate 1: Existing price alert infrastructure stable (no errors in last 4 weeks)
- Gate 2: At least one Reddit/HN post reaches 50+ upvotes (content resonates)

**Anti-patterns**:
- DO NOT use popups or interstitials (destroys UX and trust)
- DO NOT auto-subscribe anyone (double opt-in is non-negotiable)
- DO NOT spam Reddit/HN (quality posts only, max 2/month per platform)
- DO NOT gate calculator results behind subscription (results are always free)

---

### Phase B Summary

| Feature | Effort | Revenue (Month 4) | Trust Impact |
|---------|--------|-------------------|--------------|
| B1: Newsletter Sponsorship | 8-12h | $200-400/mo | +1 |
| B2: Display Sponsorship | 6-10h | $300-800/mo | +1 |
| B3: Subscriber Growth | 10-14h | $0 (multiplier) | Neutral |
| A1 (continuing): Premium PDF | -- | $300-600/mo | +2 |
| **Total Phase B effort** | **24-36h** | **$800-1,800/mo** | **Positive** |

**Phase B exit criteria (all must be true to proceed to Phase C)**:
1. At least 1 paying sponsor (newsletter or display) generating >= $200/mo
2. Subscriber count >= 3,000
3. Premium PDF purchases sustaining >= $200/mo
4. Total monthly revenue >= $500 for 2 consecutive months
5. No sponsor-related complaints from users
6. Open rate stable or improving (>= 33%)

---

## Phase C: Scale (Months 5-6) -- "Automatic Revenue Machine"

**Revenue target**: $3,000-5,000/mo by end of Month 6
**Theme**: Layer high-value B2B products (API, data licensing) on top of the proven sponsorship base. Automate everything.

### Feature C1: Pricing Data API

**1-line description**: Launch a REST API exposing current and historical LLM pricing data, with a free tier (100 req/day) and paid tiers ($29/mo for 1,000 req/day, $99/mo for 10,000 req/day).

**How it makes money**: Recurring B2B subscriptions from developers, analysts, and procurement teams who need programmatic access to LLM pricing data.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/api-v1-models/index.ts` | CREATE | `GET /api/v1/models` -- returns current pricing for all models |
| `supabase/functions/api-v1-models-history/index.ts` | CREATE | `GET /api/v1/models/:id/history` -- returns historical pricing |
| `supabase/functions/api-v1-compare/index.ts` | CREATE | `GET /api/v1/compare?models=gpt-4o,claude-3.5-sonnet&messages=5000` -- returns comparison |
| `supabase/migrations/003_api_keys.sql` | CREATE | Table `api_keys` (key, tier, rate_limit, created_at, user_email) |
| `supabase/functions/api-v1-auth/index.ts` | CREATE | API key validation middleware |
| `supabase/functions/create-api-key/index.ts` | CREATE | Generate API key after Stripe subscription |
| `src/app/pages/api-docs/api-docs.component.ts` | CREATE | `/api` page with documentation, pricing tiers, Stripe subscription CTA |
| `src/app/pages/api-docs/api-docs.component.html` | CREATE | API documentation with code examples |
| `src/app/app.routes.ts` | MODIFY | Add `/api` route |
| `public/data/api-tiers.json` | CREATE | API tier config (free: 100/day, starter: 1000/day/$29, pro: 10000/day/$99) |

**Implementation effort**: 50-70 hours
- API endpoints (3 Edge Functions): 20h
- Authentication + rate limiting: 12h
- Stripe subscription integration: 10h
- API documentation page: 10h
- Testing + load testing: 8h
- Migration + deployment: 5h

**Acceptance criteria**:
1. Free tier: 100 requests/day with API key (obtained via email registration)
2. Paid tiers: Stripe subscription, API key provisioned automatically
3. All endpoints return JSON with consistent schema
4. Rate limiting returns HTTP 429 with clear message and reset time
5. Historical data endpoint returns weekly snapshots for the requested model
6. Compare endpoint accepts 2-5 models and returns side-by-side pricing + ValueScore
7. API documentation page has interactive examples (curl commands, response previews)
8. API key management page (view key, see usage, upgrade tier)
9. Response time < 200ms for current pricing, < 500ms for historical queries
10. CORS configured for browser-based API consumers

**Revenue model**: Recurring subscriptions:
- Free tier drives adoption and authority
- $29/mo "Starter" tier targets indie devs and small startups (100-200 customers at scale)
- $99/mo "Pro" tier targets enterprise and analysts (20-50 customers at scale)
- Conservative Month 6: 10 Starter + 3 Pro = $587/mo
- Optimistic Month 6: 30 Starter + 10 Pro = $1,860/mo

**Decision gates**:
- Gate 1: Historical pricing data covers >= 12 weeks (data depth must justify API)
- Gate 2: Phase B revenue >= $500/mo sustained (proves willingness to pay in this market)
- Gate 3: At least 5 inbound requests for API access (organic demand signal)
- Gate 4: Supabase Edge Function performance acceptable under load

**Anti-patterns**:
- DO NOT gate the website behind API authentication (website stays fully free)
- DO NOT make the free API tier so limited it is useless (100 req/day is generous enough for prototyping)
- DO NOT expose individual user analytics through the API
- DO NOT allow API consumers to resell the data without a separate licensing agreement

---

### Feature C2: Sponsor Tier Upgrade

**1-line description**: Upgrade from single-sponsor model to tiered sponsorship packages, expanding from 1 to 2-3 concurrent sponsors with differentiated placements.

**How it makes money**: Multiple concurrent sponsors at different price points:
- **Platinum** ($1,500-2,500/mo): Newsletter header + calculator page banner + logo on `/insights`
- **Gold** ($800-1,200/mo): Newsletter section + one page banner
- **Silver** ($300-500/mo): Newsletter mention only

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `public/data/sponsors.json` | MODIFY | Expand schema to support multiple sponsor tiers and concurrent sponsors |
| `src/app/shared/components/sponsor-banner/sponsor-banner.component.ts` | MODIFY | Support tier-based rendering (platinum gets logo, gold gets text, etc.) |
| `docs/sponsor-kit/media-kit.md` | MODIFY | Full media kit with tiered pricing, audience proof points, case study from Phase B sponsor |

**Implementation effort**: 8-12 hours
- JSON schema expansion: 2h
- Component updates for tiers: 4h
- Media kit upgrade: 3h
- Outreach to Tier 2 and Tier 3 targets: 3h (ongoing)

**Acceptance criteria**:
1. Up to 3 sponsors can be active simultaneously without visual clutter
2. Each tier has distinct visual treatment (platinum > gold > silver visibility)
3. All sponsors clearly labeled "Sponsored" or "Partner"
4. Sponsor rotation possible within tier (e.g., alternate Gold sponsors weekly)
5. At least 2 sponsors signed within 60 days of launch

**Revenue model**: $2,600-4,200/mo at full capacity (1 Platinum + 1 Gold + 1 Silver).

**Decision gates**:
- Gate 1: Phase B sponsor retained for >= 2 months (proves sponsor satisfaction)
- Gate 2: Site traffic >= 10K MAU (justifies premium pricing)
- Gate 3: Phase B sponsor willing to provide testimonial/case study for media kit

**Anti-patterns**:
- DO NOT accept more than 3 sponsors at once (credibility erodes with clutter)
- DO NOT allow sponsors from the same category (e.g., two inference platforms)
- DO NOT let any sponsor tier affect ValueScore, rankings, or default model selection

---

### Feature C3: Automated Quarterly Report (Data Product)

**1-line description**: Generate and sell a quarterly "LLM Pricing Trends" report ($49-99) compiled automatically from historical price data, with human editorial polish.

**How it makes money**: One-time purchases of a data-rich quarterly PDF. Targets enterprise procurement, VCs, and financial analysts.

**Files to modify/create**:
| File | Action | Purpose |
|------|--------|---------|
| `src/app/core/services/quarterly-report.service.ts` | CREATE | Aggregates 12 weeks of price data, computes trends, generates report data |
| `src/app/pages/reports/reports.component.ts` | CREATE | `/reports` page listing available quarterly reports |
| `src/app/pages/reports/reports.component.html` | CREATE | Report previews, purchase CTAs |
| `src/app/app.routes.ts` | MODIFY | Add `/reports` route |
| `supabase/functions/create-report-checkout/index.ts` | CREATE | Stripe Checkout for report purchase |

**Implementation effort**: 20-30 hours
- Report generation logic: 10h
- Reports page UI: 6h
- Stripe integration (reuses A1 patterns): 4h
- First report editorial: 5h
- Distribution (email to subscribers, social): 3h

**Acceptance criteria**:
1. Quarterly report covers: price movements, new model launches, cost trajectory analysis, provider comparison, recommended strategies by segment
2. Report data is 90% automated (from `price-history.json`), 10% editorial
3. Preview available (first 3 pages free, full report gated by purchase)
4. Purchasable via Stripe Checkout ($49 standard, $99 "with dataset" including CSV export)
5. All newsletter subscribers get 20% discount code (drives list value)
6. At least 20 purchases per quarter

**Revenue model**: $49-99 per report, quarterly:
- 20 purchases at $49 = $980/quarter = ~$327/mo amortized
- 50 purchases at $69 avg = $3,450/quarter = ~$1,150/mo amortized

**Decision gates**:
- Gate 1: Price history data covers >= 12 weeks (one full quarter)
- Gate 2: Premium PDF (Feature A1) conversion rate >= 2% (proves willingness to pay for data)
- Gate 3: At least 10 subscribers reply "interested" to a pre-launch survey email

**Anti-patterns**:
- DO NOT publish the report with stale data (must be generated within 1 week of quarter end)
- DO NOT make the free preview so comprehensive that purchase is unnecessary
- DO NOT misrepresent automated analysis as "expert analysis" (be transparent about methodology)

---

### Phase C Summary

| Feature | Effort | Revenue (Month 6) | Trust Impact |
|---------|--------|-------------------|--------------|
| C1: Pricing Data API | 50-70h | $500-1,800/mo | +3 |
| C2: Sponsor Tier Upgrade | 8-12h | $2,600-4,200/mo | +1 |
| C3: Quarterly Report | 20-30h | $300-1,000/mo | +2 |
| Earlier features (A+B continuing) | -- | $800-1,800/mo | -- |
| **Total Phase C effort** | **78-112h** | **$3,200-7,800/mo** | **Highly positive** |

**Phase C exit criteria (6-month checkpoint)**:
1. Total monthly revenue >= $3,000 for 2 consecutive months
2. At least 2 distinct revenue streams each contributing >= $500/mo
3. API has >= 50 registered users (free tier counts)
4. Sponsor pipeline has >= 3 conversations in progress
5. Quarterly report completed and sold at least once

---

## Decision Register

| # | Decision | Rationale | Alternatives Rejected | Reversible? |
|---|----------|-----------|----------------------|-------------|
| D1 | **No Pro tier gating on calculator** | Trend Analyst: market shifting to free tools. Gating = user exodus to Artificial Analysis. Competitive Analyst: no successful neutral tool gates core functionality. | Freemium calculator with limited models | Yes, but not recommended |
| D2 | **No affiliate links** | Business Analyst: scored 5.4 (trust-negative). Market Researcher: enterprise procurement teams will question neutrality. | Subtle "Try on [Provider]" links | Yes |
| D3 | **Premium PDF before API** | Business Analyst: PDF scored 9.0 vs API 7.2. PDF is 3x faster to build and generates revenue 3 months earlier. | API first (higher ceiling but higher effort) | Yes -- both will be built |
| D4 | **Newsletter branding before sponsorship** | Market Researcher: sponsors need proof of engagement. 4 weeks of branded sends + open rate data = credible media kit. | Sell sponsorship immediately on bare alerts | Yes |
| D5 | **One sponsor per newsletter issue** | Competitive Analyst: TLDR and bytes.dev use single-sponsor model. Exclusivity commands premium pricing. | Multiple sponsors per issue | Yes, revisited in Phase C |
| D6 | **Stripe Checkout (hosted) over embedded** | Single developer constraint. Hosted checkout requires zero PCI compliance, minimal code. Edge Functions handle webhooks. | Embedded Stripe Elements, PayPal, Gumroad | Yes |
| D7 | **JSON config for sponsor rotation** | Allows sponsor changes without code deploys. Aligns with project pattern of JSON registries (`llm-pricing.json`, `price-history.json`). | Database-driven sponsor management | Yes |
| D8 | **Monitoring tools as first sponsor targets** | Market Researcher: monitoring tools (Helicone, LangSmith) have lowest MAU threshold ($300-500/mo at 5K MAU). Inference platforms (Together, Fireworks) are Tier 2 at 10K+ MAU. | Targeting cloud providers first (need 20K+ MAU) | Yes |
| D9 | **API at Phase C, not Phase A** | Business Analyst: 50-70h effort, 3-5 months to first dollar. Too slow for "first dollars" goal. Build after sponsorship proves market. | API first (BuiltWith model) | Yes |
| D10 | **Quarterly report as data product** | Market Researcher: consulting firms and VCs pay $199-999/mo for pricing intelligence. $49-99 quarterly report is entry-level data product testing this market. | Monthly reports (too frequent, quality drops), Annual only (too infrequent, revenue too lumpy) | Yes |

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|:-:|:-:|------------|
| **Premium PDF conversion < 1%** | Medium | Medium | A/B test pricing ($9 vs $19 vs $29). Add more visual differentiation. If still low, pivot to "free with email" model (lead gen for sponsors). |
| **No sponsors at 5K MAU** | Medium | High | Lower pricing to $100-200/mo to land first logo. First sponsor is proof-of-concept, not revenue target. Offer 1-month free trial. |
| **Stripe adds friction, kills conversion** | Low | Medium | Monitor checkout abandonment rate. If > 70%, switch to Gumroad or LemonSqueezy for simpler flow. |
| **Open rate drops below 30%** | Low | Medium | Audit subject lines, send time, content quality. Reduce to biweekly if fatigue detected. |
| **Competitor launches free API** | Medium | High (for C1) | Differentiate on data depth (historical), unique metrics (ValueScore), and ease of use. Free tier ensures we remain competitive. |
| **Reddit/HN backlash on monetization** | Low | High | Pre-empt with transparency post: "How LLM Cost Engine stays free: our monetization approach." Open-source the methodology. Label everything clearly. |
| **Supabase free tier limits hit** | Medium | Low | Upgrade to $25/mo Pro tier. At $3K+/mo revenue, this is negligible. |
| **Single-developer bus factor** | High | High | Automate everything possible. JSON configs over code. Cron jobs over manual updates. Document all processes in `thoughts/`. |
| **LLM providers change pricing structures** | Medium | Medium | Price history infrastructure already handles this. New pricing dimensions (e.g., reasoning tokens) require JSON schema updates, not architecture changes. |
| **Stripe account shutdown** | Low | High | Maintain alternative payment method (Gumroad or LemonSqueezy account ready). Do not rely on single payment processor for 100% of revenue. |

---

## Success Metrics

### Leading Indicators (check weekly)

| Metric | Phase A Target | Phase B Target | Phase C Target | Source |
|--------|:-:|:-:|:-:|--------|
| MAU | 2-3K | 5-8K | 12-15K | Vercel Analytics |
| Newsletter subscribers | 1,200-1,800 | 2,000-4,000 | 4,000-8,000 | Supabase query |
| Newsletter open rate | >= 35% | >= 33% | >= 30% | Resend analytics |
| Calculator completions/week | 500+ | 1,000+ | 2,000+ | Anonymous analytics |
| PDF downloads/week (free) | 50+ | 100+ | 200+ | Anonymous analytics |
| Premium PDF conversion rate | >= 1% | >= 2% | >= 3% | Stripe dashboard |
| Sponsor inquiries (inbound) | 0-1 | 2-3 | 5+ | Email inbox |
| API registrations | N/A | N/A | 50+ | Supabase query |

### Revenue Milestones (check monthly)

| Milestone | Target Date | Revenue | What It Proves |
|-----------|:-:|:-:|----------------|
| First dollar | Month 1-2 | $1+ | Someone will pay for LLM pricing intelligence |
| Ramen profitable | Month 3 | $500/mo | Model is viable, worth continued investment |
| Side income | Month 4-5 | $1,000/mo | Multiple revenue streams working |
| Serious income | Month 6 | $3,000/mo | Sustainable, scalable business |
| Target income | Month 8-10 | $5,000/mo | Automatic revenue machine achieved |

### Trust Health (check monthly)

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Reddit/HN sentiment | Positive mentions | No mentions | Negative mentions about bias |
| Newsletter unsubscribe rate | < 1%/send | 1-2%/send | > 2%/send |
| Sponsor label complaints | 0 | 1-2 | 3+ |
| ValueScore methodology questions | Genuine curiosity | Suspicion | Accusation of manipulation |
| Return visit rate | > 30% | 20-30% | < 20% |

---

## Month-by-Month Execution Calendar

| Month | Build | Launch | Revenue Action | Expected Revenue |
|-------|-------|--------|----------------|:--:|
| **1** | A1 (Premium PDF) + A3 (Sponsor infra) | Premium PDF beta | First PDF sales | $50-200 |
| **2** | A2 (Newsletter format) + polish A1 | Branded newsletter, PDF out of beta | PDF sales growing | $200-500 |
| **3** | B1 (Newsletter sponsor) + B3 (Growth CTAs) | First sponsor outreach, inline CTAs live | First sponsor signed | $500-1,000 |
| **4** | B2 (Display sponsor) | Display sponsor outreach | Second sponsor signed | $1,000-2,000 |
| **5** | C1 (API - build phase) | API beta (free tier only) | Sponsor revenue steady + PDF | $1,500-2,500 |
| **6** | C1 (API paid tiers) + C2 (Sponsor tiers) + C3 (Q1 Report) | API paid launch, quarterly report | API subs + upgraded sponsors | $3,000-5,000 |

---

## Implementation Order (First 4 Weeks, Detailed)

**Week 1**: Set up Stripe account, create `stripe-checkout.service.ts`, `create-checkout` Edge Function. Build premium PDF generation logic extending existing jsPDF code.

**Week 2**: Complete premium PDF UI (CTA in calculator, download page). Deploy and test end-to-end. First premium PDF sale possible by end of week 2.

**Week 3**: Redesign email template for "The LLM Price Index" branding. Build `SponsorBannerComponent` and `SponsorService`. Deploy sponsor infrastructure with placeholder.

**Week 4**: Create inline subscribe CTA component. Integrate into all 4 tools. Create media kit document. Begin tracking baseline metrics for all success indicators.

---

## Appendix: Total Effort Budget

| Phase | Feature Hours | Non-Technical Hours | Total |
|-------|:-:|:-:|:-:|
| Phase A (Month 1-2) | 50-68h | 5h (media kit draft) | 55-73h |
| Phase B (Month 3-4) | 24-36h | 10h (outreach, negotiation) | 34-46h |
| Phase C (Month 5-6) | 78-112h | 15h (outreach, editorial, docs) | 93-127h |
| **Total 6 months** | **152-216h** | **30h** | **182-246h** |

At ~10h/week side project pace = 18-25 weeks = aligns with 6-month timeline.

---

*Synthesized by Product Manager from research outputs of Trend Analyst, Competitive Analyst, Market Researcher, and Business Analyst. Pending Mattia review and approval before implementation begins.*