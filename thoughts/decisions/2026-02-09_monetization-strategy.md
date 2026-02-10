# Decision Log: Monetization Strategy

**Date**: 2026-02-09
**Decision Maker**: Mattia (pending approval)
**Agents Consulted**: Trend Analyst, Competitive Analyst, Market Researcher, Business Analyst, Product Manager, Content Marketer

---

## Context

LLM Cost Engine is pre-revenue with 4 live micro-tools, ~1,200 newsletter subscribers, and zero infrastructure costs. The owner wants automatic monthly recurring revenue as a secondary income stream.

## Decision (Revised 2026-02-10 — 3-AI Consensus)

**PHASE 1: Distribution First (Months 1-2)** — NO monetization code.

After review by ChatGPT (Content Strategist) and Gemini (Architect/PM), all three AIs converged on a critical correction: the original roadmap front-loaded 50-68h of monetization infrastructure (Stripe, Premium PDF, Sponsor system) before validating traffic. This is "infrastructure addiction."

**Revised order**:

1. **Months 1-2: DISTRIBUTE** — Manifesto blog, Newsletter rebrand, Model detail pages (programmatic SEO), Reddit/HN data posts. Only ~18h of code, rest is content.
2. **Months 3-4: FIRST MONETIZATION** — Newsletter sponsor + Display sponsor. Only if MAU >= 3K and subs >= 2K.
3. **Months 5-6: SCALE** — Premium PDF, API, Sponsor tiers. Only if Month 3-4 revenue >= $500/mo.

**The 4 revenue streams remain the same**, the ORDER changed:
1. **Newsletter Sponsorship** ("The LLM Price Index") — Month 3-4 (was Month 3-4, unchanged)
2. **B2B Display Sponsorship** (JSON-configurable banners) — Month 3-4 (was Month 3-4, unchanged)
3. **Premium PDF Reports** ($19 via Stripe) — Month 5-6 (was Month 1-2, DEFERRED)
4. **Pricing Data API** (free + $29/$99 tiers) — Month 5-6 (was Month 5-6, unchanged)

**Master plan**: `docs/90-DAY-GROWTH-PLAN.md`

## What Was Rejected and Why

| Rejected | Reason |
|----------|--------|
| Pro tier / calculator gating | Market shifting to free tools; would lose to Artificial Analysis |
| Affiliate links | Trust-negative (scored 5.4/10); enterprise users would question neutrality |
| Consulting CTAs | Doesn't scale for solo dev; distracts from tool positioning |
| Sponsored model highlights | Too risky for neutrality (scored 4.5/10); DEFERRED to Phase C evaluation |
| White-label widgets | High effort, uncertain demand (scored 3.8/10) |

## Revenue Targets (Revised)

| Month | Target | Focus | Gate |
|:---:|:---:|:---:|:---:|
| 1-2 | $0 | Distribution + Authority | N/A |
| 3-4 | $500-1,500/mo | First sponsors | MAU >= 5K, Subs >= 2.5-3K |
| 5-6 | $2,000-5,000/mo | Scale all streams | Revenue >= $500/mo sustained |

## Key Constraint

**Neutral Authority > Revenue.** Any monetization that threatens neutrality must be killed immediately, even if it reduces revenue. The tool's long-term value depends entirely on trust.

## Supporting Documents

- Research: `thoughts/research/2026-02-09_trend-open-source-shift.md`
- Research: `thoughts/research/2026-02-09_competitive-monetization-models.md`
- Research: `thoughts/research/2026-02-09_market-user-segmentation-tam.md`
- Research: `thoughts/research/2026-02-09_revenue-model-unit-economics.md`
- Roadmap (original): `thoughts/plans/2026-02-09_monetization-feature-roadmap.md`
- Content: `thoughts/plans/2026-02-09_content-monetization-amplification.md`
- **Master Plan (active)**: `docs/90-DAY-GROWTH-PLAN.md`

## 3-AI Consensus Log

| AI | Key Contribution | Agreement |
|---|---|---|
| **Claude Code** | 6-agent research + roadmap. Identified distribution-first reorder after ChatGPT/Gemini feedback | Full |
| **ChatGPT** | "Infrastructure addiction" diagnosis. Manifesto-first priority. "Stop building, start publishing" | Full |
| **Gemini** | "Engineering for Distribution" nuance. Timeline + metrics gates. Final plan in 90-DAY-GROWTH-PLAN.md | Full |

## Status

**APPROVED** — 3-AI consensus reached 2026-02-10. Execution begins with Week 1: Manifesto.
