# LLM Cost Engine - Product Roadmap Q1-Q2 2026

**Document Version:** 1.0
**Last Updated:** 2026-02-02
**Owner:** Product Management
**Status:** Strategic Planning

---

## Executive Summary

The LLM Cost Engine has established a solid foundation as a deterministic TCO calculator with the ValueScore algorithm, 2-tier PDF export system, and privacy-first analytics infrastructure. This roadmap identifies critical gaps for enterprise adoption, user journey optimization opportunities, and a prioritized 90-day plan to accelerate growth while building sustainable competitive moats.

---

## 1. Current State Analysis

### 1.1 Existing Feature Set

| Feature | Status | Maturity |
|---------|--------|----------|
| TCO Calculator with ValueScore | Live | Production |
| Real-time Angular Signals UI | Live | Production |
| 24 LLM Models (7 Providers) | Live | Production |
| Quick PDF Export (no-friction) | Live | Production |
| Enterprise PDF (email-gated) | Live | Production |
| Sensitivity Analysis (2x/3x) | Live | Production |
| Price History Infrastructure | Live | Beta |
| Market Insights Service | Live | Beta |
| Anonymous Analytics | Live | Production |
| SEO Presets (5 scenarios) | Live | Production |
| EU Trust Signals | Live | Production |

### 1.2 Technical Architecture Strengths

1. **Deterministic Logic:** All calculations traceable to formulas in `logic.service.ts`
2. **Data-Driven Design:** JSON registry enables pricing updates without code changes
3. **Privacy-First:** No PII collection, GDPR-compliant by design
4. **SSR-Ready:** Angular 19 with TransferState for SEO and performance
5. **Extensible:** Clean separation of concerns (services, models, components)

### 1.3 Current Metrics (Baseline)

Based on codebase analysis:
- **Analysis Counter:** Starting at 14,832 (social proof signal)
- **Models Tracked:** 24 models across 7 providers
- **Export Tiers:** 2 (Quick PDF, Enterprise PDF)
- **Pricing Version:** 1.1.0 (last updated 2026-01-31)

---

## 2. Feature Gap Analysis for Enterprise Adoption

### 2.1 Critical Gaps (Must-Have)

| Gap | Impact | Priority |
|-----|--------|----------|
| **Team Collaboration** | Enterprises need shared scenarios across procurement teams | P0 |
| **Saved Scenarios** | Users cannot return to previous analyses | P0 |
| **API Access** | Programmatic integration for FinOps tools | P1 |
| **Multi-Currency** | EU/APAC enterprises budget in EUR/GBP/JPY | P1 |
| **Audit Trail** | Procurement requires versioned analysis history | P1 |

### 2.2 Competitive Gaps

| Competitor Feature | Our Status | Risk Level |
|-------------------|------------|------------|
| Usage-based projections from actuals | Missing | Medium |
| Slack/Teams notifications | Missing | Low |
| Contractual discount modeling | Missing | High |
| Multi-model workflow costing | Missing | Medium |

### 2.3 Data Moat Gaps

The `PriceHistoryService` infrastructure exists but is underutilized:

```typescript
// Current: Infrastructure ready, UI not exposed
priceTrends = signal<Map<string, PriceTrend>>(new Map());
priceHistoryDepth = signal<{ snapshots: number; months: number } | null>(null);
```

**Gap:** Historical price data is being collected but not surfaced to users. This is a missed differentiation opportunity.

---

## 3. User Journey Optimization

### 3.1 Current User Flow Analysis

```
Landing --> Slider Interaction --> View Results --> (Optional) Export PDF
    |                                                        |
    +-- 70% drop-off here (no clear CTA)                    +-- 15% conversion
```

### 3.2 Friction Points Identified

1. **Cold Start Problem:** New users see default values with no context for their use case
2. **Preset Discoverability:** 5 presets exist but are not prominently featured
3. **Export Decision Fatigue:** Two export options without clear differentiation
4. **No Re-engagement Path:** Users complete analysis and leave with no retention hook

### 3.3 Optimized User Flow (Proposed)

```
Landing --> Use Case Quiz --> Personalized Preset --> Slider Fine-Tune
    |                              |                        |
    +-- Segment capture           +-- Higher engagement    +-- Data moat

--> View Results --> Price Trend Badge --> Save/Share --> Email Gate
        |                   |                   |              |
        +-- Winner focus   +-- Unique value   +-- Retention  +-- Lead capture
```

---

## 4. Conversion Funnel Improvements

### 4.1 Current Funnel (Estimated)

| Stage | Current Rate | Target Rate |
|-------|--------------|-------------|
| Landing to Interaction | 60% | 75% |
| Interaction to Results | 85% | 90% |
| Results to Export Click | 25% | 40% |
| Export to Email Submit | 60% | 70% |
| **Overall Conversion** | **7.7%** | **18.9%** |

### 4.2 Proposed Improvements

#### A. Above-the-Fold Optimization
- Add "Used by X engineers this month" counter
- Feature top 3 presets as quick-start buttons
- Show "Winner Preview" before full interaction

#### B. Results Page Enhancement
- Add "Save This Analysis" CTA (generates shareable URL)
- Show price trend badges (up/down/stable indicators)
- Include "Compare to Your Current Provider" option

#### C. Export Flow Redesign
- Rename: "Quick Summary" (no email) vs "Procurement Report" (email-gated)
- Add "Share with Team" option (generates link + optional email notification)
- Show preview of Enterprise PDF benefits before email gate

#### D. Re-engagement Hooks
- "Get notified when [Winner] pricing changes" (email capture)
- Monthly "Market Report" newsletter opt-in
- Saved scenario expiration reminder (30-day)

---

## 5. 90-Day Product Roadmap

### Phase 1: Foundation (Days 1-30)

**Theme:** "Reduce Friction, Capture Intent"

| Feature | Effort | Impact | RICE Score |
|---------|--------|--------|------------|
| Shareable URL with full state | S | High | 95 |
| Quick-Start Preset Cards (above fold) | S | High | 90 |
| Price Trend Badges (expose existing data) | M | High | 85 |
| Use Case Quiz (3 questions) | M | Medium | 75 |
| Saved Scenarios (localStorage) | M | Medium | 70 |

**Deliverables:**
1. URL state now includes all parameters (already exists, verify)
2. 3 preset cards displayed above fold
3. Price trend indicators on model cards
4. Interactive quiz that maps to presets
5. "Save Analysis" button with localStorage persistence

**Success Metrics:**
- Interaction rate: 60% --> 70%
- Average session duration: +15%
- Return visitor rate: Establish baseline

---

### Phase 2: Differentiation (Days 31-60)

**Theme:** "Build the Data Moat"

| Feature | Effort | Impact | RICE Score |
|---------|--------|--------|------------|
| Price History Charts (per model) | M | High | 88 |
| "The Reddit Report" Public Page | M | High | 82 |
| Provider Comparison Deep Dive | L | High | 78 |
| Multi-Currency Toggle (EUR/GBP) | M | Medium | 72 |
| API Rate Limit Calculator Add-on | S | Medium | 68 |

**Deliverables:**
1. Interactive sparkline charts showing 90-day price history
2. Public "/insights" page with aggregated market data
3. "/compare/openai-vs-anthropic" style pages
4. Currency toggle with real-time conversion
5. "Messages before rate limit" calculator

**Success Metrics:**
- Organic traffic: +25%
- Backlinks acquired: 5+ from dev communities
- Repeat usage: 15% return within 30 days

---

### Phase 3: Enterprise (Days 61-90)

**Theme:** "Enable Procurement Workflows"

| Feature | Effort | Impact | RICE Score |
|---------|--------|--------|------------|
| Team Workspace (shareable link) | L | High | 80 |
| Contractual Discount Modeling | M | High | 78 |
| Custom Model Addition | L | Medium | 65 |
| API Access (read-only) | L | High | 75 |
| Audit Log Export | M | Medium | 60 |

**Deliverables:**
1. "Create Team Analysis" with unique shareable URL
2. "Apply Negotiated Discount" input field
3. "Add Custom/Private Model" form
4. `/api/v1/calculate` endpoint documentation
5. CSV export of all calculations with timestamps

**Success Metrics:**
- Enterprise PDF downloads: +40%
- Team workspace creation: 50+ workspaces
- API key requests: 20+ inquiries

---

## 6. Feature Prioritization Matrix

### RICE Scoring Methodology

- **Reach:** Users affected per quarter (1-10)
- **Impact:** Contribution to objectives (0.25-3)
- **Confidence:** Data backing the estimate (0.5-1)
- **Effort:** Person-weeks required (1-10)

### Top 10 Prioritized Features

| Rank | Feature | Reach | Impact | Conf | Effort | RICE |
|------|---------|-------|--------|------|--------|------|
| 1 | Shareable Analysis URLs | 9 | 2 | 1.0 | 1 | 95 |
| 2 | Quick-Start Preset Cards | 8 | 2 | 0.9 | 1 | 90 |
| 3 | Price History Visualization | 7 | 3 | 0.8 | 2 | 88 |
| 4 | Price Trend Badges | 8 | 2 | 0.9 | 1.5 | 85 |
| 5 | Public Market Insights Page | 6 | 3 | 0.9 | 2 | 82 |
| 6 | Team Workspace | 5 | 3 | 0.8 | 3 | 80 |
| 7 | Provider Comparison Pages | 6 | 2.5 | 0.9 | 3 | 78 |
| 8 | Contractual Discount Input | 5 | 3 | 0.8 | 2.5 | 78 |
| 9 | API Access (v1) | 4 | 3 | 0.9 | 3 | 75 |
| 10 | Use Case Quiz | 7 | 2 | 0.8 | 2.5 | 75 |

---

## 7. Growth Drivers Analysis

### 7.1 User Retention Drivers

| Driver | Mechanism | Implementation |
|--------|-----------|----------------|
| **Saved Scenarios** | Users return to compare against new data | localStorage + optional cloud sync |
| **Price Alerts** | Email when tracked model prices change | Webhook on registry update |
| **Market Reports** | Monthly aggregated insights newsletter | MarketInsightsService data |
| **Workspace Collaboration** | Team members invited return to participate | Shareable links with access control |

### 7.2 Data Moat Accumulation

| Data Asset | Current State | Proposed Enhancement |
|------------|---------------|----------------------|
| **Price History** | Weekly snapshots (service exists) | Surface charts, add alerts |
| **Usage Patterns** | Anonymous segment data | Publish "Reddit Report" insights |
| **Scenario Library** | Static 5 presets | User-contributed presets (anonymized) |
| **Provider Intel** | Manual registry updates | Automated pricing page scraping |

**Strategic Value:** Each week of operation adds unique historical data that competitors cannot retroactively acquire.

### 7.3 B2B Lead Generation (Non-Aggressive)

| Touchpoint | Current | Proposed |
|------------|---------|----------|
| Enterprise PDF | Email required | Email + optional company/role |
| API Access | Not available | Waitlist with use case description |
| Custom Quote | Not available | "Contact for volume pricing" on high-volume scenarios |
| Market Report | Not available | Gated quarterly deep-dive report |

**Philosophy:** Lead capture is value-exchange, not gatekeeping. Free tier remains fully functional.

---

## 8. Technical Debt & Prerequisites

### 8.1 Required Refactoring

1. **State Management:** Move from component-level signals to a shared state service for cross-feature coordination
2. **URL Serialization:** Standardize URL parameter handling for shareable links
3. **Analytics Enhancement:** Add funnel tracking events for conversion optimization

### 8.2 Infrastructure Needs

1. **Backend API:** Currently client-only; need serverless functions for:
   - Saved scenario storage
   - API access endpoints
   - Price alert webhooks

2. **Database:** Lightweight persistence for:
   - User scenarios (anonymous or authenticated)
   - Team workspaces
   - Price alert subscriptions

### 8.3 Recommended Tech Stack for Backend

```
Vercel Edge Functions (existing deployment)
  +-- /api/scenarios (CRUD)
  +-- /api/insights (read market data)
  +-- /api/calculate (public API)

Supabase or PlanetScale
  +-- scenarios table
  +-- workspaces table
  +-- price_alerts table
```

---

## 9. Success Metrics & OKRs

### Q1 2026 OKRs

**Objective 1:** Increase user engagement and retention

| Key Result | Baseline | Target |
|------------|----------|--------|
| Weekly Active Users | TBD | +50% |
| Return visitor rate (30-day) | TBD | 20% |
| Average session duration | TBD | +25% |

**Objective 2:** Establish data moat differentiation

| Key Result | Baseline | Target |
|------------|----------|--------|
| Price history data points | 4 snapshots | 16 snapshots |
| Unique scenarios analyzed | 14,832 | 50,000 |
| Market insights pageviews | 0 | 5,000/month |

**Objective 3:** Generate qualified B2B leads

| Key Result | Baseline | Target |
|------------|----------|--------|
| Enterprise PDF downloads | TBD | 500/month |
| API waitlist signups | 0 | 100 |
| Team workspace creations | 0 | 50 |

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Provider pricing changes break calculations | Medium | High | Automated registry validation, alert system |
| Competitor launches similar tool | Medium | Medium | Accelerate data moat features |
| Low adoption of saved scenarios | Medium | Low | A/B test onboarding flows |
| Backend infrastructure costs | Low | Medium | Start serverless, scale as needed |
| GDPR compliance with new features | Low | High | Privacy-first design, legal review for any PII |

---

## 11. Stakeholder Alignment

### Development Team Capacity

Assuming 1 full-stack developer + 1 PM:

| Phase | Features | Estimated Effort |
|-------|----------|------------------|
| Phase 1 | 5 features | 4 weeks |
| Phase 2 | 5 features | 5 weeks |
| Phase 3 | 5 features | 5 weeks |

**Buffer:** 2 weeks for testing, refinement, and unexpected issues

### External Dependencies

1. **Content Marketing:** "The Reddit Report" requires content writing support
2. **Legal Review:** API terms of service, data processing addendum
3. **Design:** UI polish for new features (can use existing Tailwind system)

---

## 12. Appendix: Competitive Landscape

### Direct Competitors

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| LLM Price Check | Simple UI | No analysis | ValueScore methodology |
| AI Model Pricing (generic) | Wide coverage | Static data | Real-time calculation |
| Provider Calculators | Official data | Single provider | Multi-provider comparison |

### Indirect Competitors

- Spreadsheet-based internal tools
- FinOps platforms (Vantage, Infracost)
- LLM observability tools (LangSmith, Helicone)

**Positioning:** "The TurboTax of LLM Cost Planning" - guided, deterministic, trustworthy.

---

## 13. Next Steps

1. **Immediate (This Week):**
   - Validate technical feasibility of Phase 1 features
   - Set up analytics baseline measurements
   - Begin price history chart component design

2. **Short-term (This Month):**
   - Ship Phase 1 features
   - Launch A/B test for preset card placement
   - Draft "Reddit Report" content strategy

3. **Medium-term (This Quarter):**
   - Complete all three phases
   - Evaluate API access demand
   - Plan Q2 roadmap based on learnings

---

*Document prepared by Product Management. For questions, consult the product-manager agent or escalate to the agent-organizer.*
