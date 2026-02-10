# LLM Cost Engine - Product & Feature Analysis

**Document Version**: 1.0
**Analysis Date**: 2026-02-02
**Prepared by**: Product Manager Agent (Claude Code)
**Purpose**: Cross-AI collaboration document for Gemini, ChatGPT, and internal teams

---

## Executive Summary

LLM Cost Engine is an Angular 19 SSR application that provides deterministic Total Cost of Ownership (TCO) analysis for enterprise LLM deployments. The product differentiates through:

1. **Transparent Methodology** - Open-source ValueScore algorithm
2. **Data Moat Strategy** - Accumulating historical pricing data
3. **Enterprise Focus** - Procurement-ready PDF exports
4. **Privacy-First Analytics** - Anonymous market intelligence ("The Reddit Report")

**Current State**: MVP with core features complete. Ready for growth phase optimization.

---

## 1. Feature Inventory

### 1.1 Core Calculator Features

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Multi-model TCO comparison | COMPLETE | `logic.service.ts` | 24 models across 7 providers |
| Real-time cost calculation | COMPLETE | Angular Signals | Zero-debounce reactivity |
| ValueScore ranking algorithm | COMPLETE | Deterministic formula | Alpha=0.65, Beta=0.35 |
| Prompt caching ROI | COMPLETE | Cached vs non-cached pricing | Per-provider rates |
| Daily cost breakdown | COMPLETE | Input NC/Cached/Output split | Transparency feature |
| Context window factoring | COMPLETE | Logarithmic scaling | Diminishing returns model |
| Latency index multiplier | COMPLETE | 0-1 scale per model | Provider benchmarks |

### 1.2 Advanced Features

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| **Smart Routing Simulator** | COMPLETE | `routedMonthlyCost` computed | Unique differentiator |
| Model filter (1-5 selection) | COMPLETE | `selectedModelIds` signal | UX constraint |
| Use case presets | COMPLETE | 5 presets (Startup, Enterprise, RAG, etc.) | Quick-start UX |
| Sensitivity analysis (2x/3x) | COMPLETE | Traffic scaling projections | CFO-ready data |
| Scenario ID generation | COMPLETE | Deterministic hash | Audit trail |
| URL state sync (deep linking) | COMPLETE | Query params hydration | Shareable links |
| Dynamic meta tags | COMPLETE | Per-scenario SEO | Programmatic SEO |

### 1.3 Price Trends & Data Moat

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Price history service | COMPLETE | `price-history.service.ts` | Weekly snapshots |
| 30-day trend calculation | COMPLETE | Percentage change tracking | Up/Down/Stable |
| 90-day trend calculation | COMPLETE | Longer-term analysis | Available in service |
| Trend indicators on cards | COMPLETE | Visual badges | Green/Red/Gray |
| Price change alerts | INFRASTRUCTURE | Data structure ready | UI not implemented |

### 1.4 Market Insights ("The Reddit Report")

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Insights landing page | COMPLETE | `/insights` route | Standalone page |
| Market segment breakdown | COMPLETE | Startup/Scaleup/Enterprise | Aggregated data |
| Monthly highlights | COMPLETE | Top model, cost saver, fastest growing | Static for now |
| Key takeaways | COMPLETE | 4 insight cards | Editorial content |
| Anonymous analytics | COMPLETE | `analytics.service.ts` | Privacy-first |
| Batch sync to API | INFRASTRUCTURE | sendBeacon implementation | Endpoint needed |

### 1.5 SEO & Marketing Features

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| SoftwareApplication schema | COMPLETE | JSON-LD injection | Rich snippets |
| FAQPage schema | COMPLETE | 4 Q&As | Featured snippets |
| Dynamic canonical URLs | COMPLETE | Per-scenario canonical | Prevents duplicate content |
| SEO presets (5 scenarios) | COMPLETE | `seo-presets.ts` | Long-tail targeting |
| Open Graph tags | COMPLETE | Dynamic per scenario | Social sharing |
| Pricing verification badge | COMPLETE | "Verified [date]" | Trust signal |

### 1.6 Export Features

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Quick PDF export | COMPLETE | jsPDF + autoTable | No email required |
| Enterprise PDF report | COMPLETE | Full analysis with sensitivity | Email gated |
| Lead capture form | COMPLETE | Email validation | Marketing funnel |
| Scenario ID in exports | COMPLETE | Audit trail reference | Procurement ready |
| Pricing version stamp | COMPLETE | Version in footer | Compliance |

### 1.7 Technical Infrastructure

| Feature | Status | Implementation | Notes |
|---------|--------|----------------|-------|
| Angular 19 SSR | COMPLETE | Server-side rendering | SEO critical |
| TransferState hydration | COMPLETE | Zero CLS data loading | Performance |
| Standalone components | COMPLETE | Modern Angular pattern | Bundle optimization |
| Tailwind CSS | COMPLETE | Utility-first styling | Design system |
| JSON pricing registry | COMPLETE | `llm-registry.json` | Data-driven |
| GDPR compliance signals | COMPLETE | Trust badges | EU market |

---

## 2. User Journeys

### 2.1 Primary Flow: Quick Analysis (80% of users)

```
Landing Page
    |
    v
[Select Scale Card] --> Startup (2K) / Growth (25K) / Enterprise (15K RAG)
    |
    v
[View Results] --> Winner card appears immediately
    |
    v
[Adjust Sliders] --> Real-time updates
    |
    v
[Quick Export PDF] --> Download without email
    |
    v
Exit (or continue to Enterprise flow)
```

**Current Metrics (estimated)**:
- Time to first result: ~2 seconds (SSR)
- Slider interactions per session: 4-8
- Quick PDF download rate: ~15%

### 2.2 Secondary Flow: Enterprise Analysis (20% of users)

```
Primary Flow completion
    |
    v
[Enable Smart Routing] --> Configure 2-model split
    |
    v
[Review Sensitivity Analysis] --> 2x/3x projections
    |
    v
[Get Enterprise Report] --> Email form appears
    |
    v
[Enter Email + Download] --> Full PDF with Scenario ID
    |
    v
Share internally (CFO/CTO)
```

**Conversion Points**:
- Routing enablement: ~8% of sessions
- Enterprise PDF requests: ~3% of sessions

### 2.3 Friction Points Identified

| Stage | Friction | Severity | Recommendation |
|-------|----------|----------|----------------|
| Initial load | Model selector overwhelming (24 models) | Medium | Default to 3-5 curated models |
| Preset selection | Enterprise RAG preset is niche | Low | Consider "Content Generation" as 3rd card |
| Routing simulator | Requires selecting 2+ models first | Medium | Auto-suggest optimal pair |
| Export flow | Email validation strict | Low | Accept more formats |
| Mobile experience | Slider precision difficult | High | Add number input option |

### 2.4 Conversion Funnel Status

```
Stage                   Estimated Rate    Target
-------------------------------------------------
Visit landing page      100%              100%
Interact with sliders   ~60%              75%
Select custom models    ~25%              35%
Enable routing          ~8%               15%
Quick PDF download      ~15%              25%
Enterprise PDF request  ~3%               8%
```

---

## 3. Feature Gaps Analysis

### 3.1 Missing for Enterprise Adoption

| Gap | Priority | Complexity | Impact |
|-----|----------|------------|--------|
| **API cost history chart** | HIGH | Medium | Visual data moat proof |
| **Team sharing/collaboration** | HIGH | High | Multi-stakeholder workflows |
| **Custom model addition** | MEDIUM | Low | Self-hosted LLM support |
| **Batch scenario comparison** | MEDIUM | Medium | Compare 3+ scenarios side-by-side |
| **White-label PDF branding** | LOW | Low | Agency/consultant use case |
| **SSO/Authentication** | LOW | High | Enterprise security requirements |

### 3.2 Missing for User Retention

| Gap | Priority | Complexity | Impact |
|-----|----------|------------|--------|
| **Saved scenarios** | HIGH | Medium | Return visit incentive |
| **Email alerts on price changes** | HIGH | Medium | Re-engagement hook |
| **Monthly insights newsletter** | MEDIUM | Low | Content marketing |
| **Model comparison history** | MEDIUM | Low | Track decision evolution |
| **Usage predictions** | LOW | High | "Your costs next month" |

### 3.3 Competitive Gaps

Competitors analyzed: LiteLLM, Helicone, Langfuse

| Feature | LLM Cost Engine | LiteLLM | Helicone | Langfuse |
|---------|-----------------|---------|----------|----------|
| Free TCO calculator | YES | No | No | No |
| Price trend tracking | YES | No | No | No |
| Smart routing simulator | YES | Partial | No | No |
| PDF export | YES | No | Yes | Yes |
| Real usage integration | NO | Yes | Yes | Yes |
| Observability/tracing | NO | Yes | Yes | Yes |
| Self-hosted option | NO | Yes | Yes | Yes |
| API access | NO | Yes | Yes | Yes |

**Key Insight**: Competitors focus on observability. LLM Cost Engine wins on pre-purchase decision support. Consider positioning as "choose before you integrate."

---

## 4. Product Roadmap

### 4.1 Immediate Priorities (This Week)

| Task | Owner | Rationale |
|------|-------|-----------|
| Fix mobile slider UX | angular-architect | High friction point |
| Add number input fallback | fullstack-developer | Accessibility |
| Implement price chart visualization | fullstack-developer | Data moat visual proof |
| Create API endpoint for insights sync | devops-engineer | Analytics backend |

### 4.2 30-Day Plan (February 2026)

**Theme**: "Data Moat Activation"

| Week | Deliverables |
|------|--------------|
| Week 1 | Price history visualization (chart.js/lightweight), Mobile UX fixes |
| Week 2 | Saved scenarios (localStorage MVP), Share scenario via URL improvements |
| Week 3 | Email alert signup for price changes, Insights API endpoint live |
| Week 4 | A/B test new preset cards, SEO content expansion (5 new long-tail pages) |

**Success Metrics**:
- Slider interaction rate: 60% -> 75%
- Routing feature adoption: 8% -> 15%
- Weekly return visitors: baseline -> +20%

### 4.3 90-Day Vision (Q1 2026)

**Theme**: "From Calculator to Platform"

| Initiative | Description | Business Impact |
|------------|-------------|-----------------|
| **Custom Models** | Add self-hosted/custom pricing entries | Enterprise expansion |
| **Scenario Comparison** | Side-by-side 3+ scenario view | Decision support depth |
| **Integrations MVP** | Import actual usage from Helicone/Langfuse | Real-world validation |
| **API Access** | Public API for TCO calculations | Developer adoption |
| **Insights Premium** | Gated advanced market data | Revenue stream |

**Q1 OKRs**:
- O1: Become the default pre-purchase LLM decision tool
  - KR1: 50K monthly active users
  - KR2: 500 enterprise PDF downloads/month
  - KR3: 3 integration partnerships
- O2: Build defensible data moat
  - KR1: 12 months of price history data
  - KR2: 100K+ simulation data points
  - KR3: Monthly insights report with 10K subscribers

---

## 5. Technical Architecture Summary

### 5.1 Current Stack

```
Frontend:
- Angular 19 (Standalone Components, Signals)
- Tailwind CSS
- SSR via @angular/ssr

Data:
- Static JSON registry (llm-registry.json)
- Static price history (price-history.json)
- LocalStorage for analytics aggregation

Build/Deploy:
- Vercel (assumed from vercel.app domain)
- No backend API currently
```

### 5.2 Data Flow

```
[User Inputs] --> [Signals]
       |
       v
[Logic Service] --> calculateMonthlyCost() --> calculateValueScore()
       |
       v
[Results] --> [Template Binding]
       |
       v
[Analytics Service] --> [MarketInsightsService] --> [LocalStorage]
                                                 --> [API (future)]
```

### 5.3 Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Main calculator | `/src/app/engines/chatbot-simulator/chatbot-simulator.component.ts` |
| Cost logic | `/src/app/engines/chatbot-simulator/logic.service.ts` |
| Pricing data | `/src/assets/data/llm-registry.json` |
| Price history | `/src/assets/data/price-history.json` (assumed) |
| Analytics | `/src/app/core/services/analytics.service.ts` |
| Insights page | `/src/app/insights/insights.component.ts` |
| SEO presets | `/src/app/core/configs/seo-presets.ts` |
| Engine weights | `/src/app/core/constants/engine-weights.ts` |

---

## 6. Collaboration Notes for AI Partners

### 6.1 For Gemini (Strategic/PM Work)

- Market research on self-hosted LLM pricing (Llama, Mistral local)
- Competitive analysis updates quarterly
- SEO keyword research for new long-tail pages
- Content strategy for insights newsletter

### 6.2 For ChatGPT (Content/Copy Work)

- FAQ expansion (target: 10 questions)
- Blog post drafts for insights reports
- Email sequences for price alert signups
- Social media copy for feature launches

### 6.3 For Claude (Development Work)

- All TypeScript/Angular implementation
- Test coverage expansion
- Performance optimization
- Accessibility compliance (WCAG 2.1)

---

## 7. Open Questions for Discussion

1. **Monetization**: Should "Insights Premium" be the first revenue stream, or API access?

2. **Integration Priority**: Helicone vs Langfuse vs direct provider APIs for usage import?

3. **Self-Hosted Support**: How to handle local LLM pricing (variable infrastructure costs)?

4. **Data Retention**: How long to keep simulation data for insights? GDPR implications?

5. **Competitive Response**: If LiteLLM adds a similar calculator, what's our differentiation?

---

## Appendix A: Model Coverage

**24 models across 7 providers** (as of 2026-01-31):

| Provider | Models | Tier Coverage |
|----------|--------|---------------|
| OpenAI | 6 | GPT-4o, GPT-4o Mini, GPT-4 Turbo, o1, o1-mini, o3-mini |
| Anthropic | 6 | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3.5 Haiku, Claude Opus 4, Claude Sonnet 4 |
| Google | 5 | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini 2.0 Flash Thinking |
| Mistral | 3 | Mistral Large, Mistral Small, Codestral |
| Meta | 3 | Llama 3.3 70B, Llama 3.2 90B Vision, Llama 3.2 11B Vision |
| Cohere | 2 | Command R+, Command R |
| DeepSeek | 2 | DeepSeek V3, DeepSeek R1 |

---

## Appendix B: ValueScore Formula

```
ValueScore = (1 / MonthlyCost)^0.65 x log10(ContextWindow)^0.35 x LatencyIndex
```

**Component Weights**:
- Cost Efficiency (Alpha): 65% - Primary ROI driver
- Context Capacity (Beta): 35% - Enterprise requirement with diminishing returns
- Latency Index: Linear multiplier (0-1)

**Edge Cases**:
- MonthlyCost = 0: Use epsilon (0.0001)
- ContextWindow missing: Default 8,000 tokens
- LatencyIndex missing: Default 0.5

---

*Document generated for AI collaboration. Update with each major feature release.*
