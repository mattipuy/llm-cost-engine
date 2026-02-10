# Business Analysis: Revenue Model Unit Economics

**Date**: 2026-02-09
**Agent**: Business Analyst
**Question**: For each revenue stream, what are the unit economics and which combination maximizes (Revenue x Trust) / Effort?

---

## Current Cost Baseline

| Item | Monthly Cost |
|------|-------------|
| Vercel hosting (free tier) | $0 |
| Supabase (free tier) | $0 |
| GitHub Actions (free tier) | $0 |
| Resend (free tier, 3K emails/mo) | $0 |
| Domain | ~$1/mo (amortized) |
| **Total** | **~$1/mo** |

This is important: the break-even is essentially $0. Every dollar of revenue is pure margin.

---

## Revenue Stream Analysis (8 Streams)

### 1. B2B Display Sponsorship

"Sponsored by [Provider]" banner — non-intrusive, in tool results area.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $200-400/mo |
| Revenue @20K MAU | $800-2,000/mo |
| Revenue @50K MAU | $2,000-5,000/mo |
| Implementation effort | **Low** (~8-16h) |
| Time to first dollar | 2-4 months (need traffic first) |
| Trust impact | **+1** (sponsors signal legitimacy) |
| Scalability | Linear with traffic |
| Automation level | **7/10** (set up once, rotate monthly) |
| **Composite Score** | **8.3** |

### 2. Sponsored Model Highlights

"Featured" badge on specific models, clearly labeled "Sponsored".

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $300-500/mo |
| Revenue @20K MAU | $1,000-3,000/mo |
| Revenue @50K MAU | $3,000-8,000/mo |
| Implementation effort | **Medium** (~16-24h) |
| Time to first dollar | 3-6 months (need authority + sales) |
| Trust impact | **-1** (risky even if labeled — users may question neutrality) |
| Scalability | Flat per sponsor |
| Automation level | **5/10** (requires ongoing sales/relationship) |
| **Composite Score** | **4.5** |

### 3. Premium Data Reports (PDF)

Enhanced PDF with historical trends, market context, methodology notes. $9-29 one-time or $19-49/mo subscription.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $100-400/mo |
| Revenue @20K MAU | $500-2,000/mo |
| Revenue @50K MAU | $1,500-5,000/mo |
| Implementation effort | **Medium** (~24-40h) |
| Time to first dollar | 1-2 months |
| Trust impact | **+2** (adds value, doesn't gate existing features) |
| Scalability | Linear with traffic, high margin |
| Automation level | **9/10** (fully automated generation) |
| **Composite Score** | **9.0** |

### 4. API Access (Pricing Data + ValueScore)

REST API: Free tier (100 req/day) + paid ($29-99/mo).

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $0-200/mo |
| Revenue @20K MAU | $500-2,000/mo |
| Revenue @50K MAU | $2,000-8,000/mo |
| Implementation effort | **High** (~40-80h) |
| Time to first dollar | 3-5 months |
| Trust impact | **+3** (data API enhances authority, like BuiltWith model) |
| Scalability | Exponential (recurring B2B subscribers) |
| Automation level | **10/10** (fully automated) |
| **Composite Score** | **7.2** |

### 5. Newsletter Sponsorship

"This week's digest sponsored by [Provider]" in weekly price alert email.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU (→ ~1K subs) | $100-300/mo |
| Revenue @20K MAU (→ ~4K subs) | $500-1,500/mo |
| Revenue @50K MAU (→ ~10K subs) | $1,500-4,000/mo |
| Implementation effort | **Low** (~4-8h) |
| Time to first dollar | 2-3 months (need 1K+ subs) |
| Trust impact | **+1** (standard industry practice, clearly labeled) |
| Scalability | Linear with subscriber growth |
| Automation level | **8/10** (template once, swap sponsor) |
| **Composite Score** | **8.8** |

### 6. Affiliate Links (Non-Aggressive)

"Try [Model] →" links to provider signup with referral tracking.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $50-200/mo |
| Revenue @20K MAU | $200-800/mo |
| Revenue @50K MAU | $500-2,000/mo |
| Implementation effort | **Low** (~4-8h) |
| Time to first dollar | 1-2 months |
| Trust impact | **-1** (users may perceive bias toward providers with affiliate programs) |
| Scalability | Linear with traffic |
| Automation level | **9/10** (set and forget) |
| **Composite Score** | **5.4** |

### 7. Data Licensing (Enterprise)

Historical pricing dataset, trend data, market snapshots. $99-499/mo subscription.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $0/mo |
| Revenue @20K MAU | $500-2,000/mo |
| Revenue @50K MAU | $2,000-10,000/mo |
| Implementation effort | **High** (~60-100h) |
| Time to first dollar | 4-8 months |
| Trust impact | **+3** (data licensing ENHANCES authority) |
| Scalability | Exponential (recurring, high-value) |
| Automation level | **9/10** (automated data collection already exists) |
| **Composite Score** | **6.5** |

### 8. White-Label / Embedded Widget

Embeddable calculator for company blogs/docs. Free with branding, $99-299/mo without.

| Metric | Value |
|--------|-------|
| Revenue @5K MAU | $0/mo |
| Revenue @20K MAU | $200-500/mo |
| Revenue @50K MAU | $500-2,000/mo |
| Implementation effort | **High** (~40-60h) |
| Time to first dollar | 4-6 months |
| Trust impact | **+2** (distribution enhances authority) |
| Scalability | Flat per customer |
| Automation level | **8/10** (embed once) |
| **Composite Score** | **3.8** |

---

## Ranked by Composite Score

| Rank | Stream | Score | Why |
|------|--------|:-----:|-----|
| 1 | **Premium Data Reports (PDF)** | 9.0 | High trust, high automation, low-medium effort, immediate |
| 2 | **Newsletter Sponsorship** | 8.8 | Very low effort, good trust, scales with list |
| 3 | **B2B Display Sponsorship** | 8.3 | Low effort, positive trust signal, steady income |
| 4 | **API Access** | 7.2 | Highest long-term potential, but high initial effort |
| 5 | **Data Licensing** | 6.5 | Highest ceiling, but needs traffic + time |
| 6 | **Affiliate Links** | 5.4 | Easy but trust-negative |
| 7 | **Sponsored Model Highlights** | 4.5 | Good money but trust risk |
| 8 | **White-Label Widget** | 3.8 | Too much effort for uncertain demand |

---

## Recommended Monetization Stack (Top 3)

### Tier 1 (Immediate — Month 1-2)
**Premium Data Reports + Newsletter Sponsorship**
- Combined effort: ~30h
- Revenue month 2: $200-500/mo
- Trust impact: Positive

### Tier 2 (Growth — Month 3-4)
**Add B2B Display Sponsorship**
- Additional effort: ~12h
- Revenue month 4: $800-2,000/mo total
- Begin sponsor outreach to inference platforms

### Tier 3 (Scale — Month 5-6)
**Add API Access**
- Additional effort: ~60h
- Revenue month 6: $1,500-4,000/mo total
- B2B recurring revenue foundation

---

## Month-by-Month Revenue Projection (Recommended Stack)

| Month | MAU (est.) | Subs (est.) | Premium PDF | Newsletter | Display Sponsor | API | **Total** |
|-------|-----------|-------------|-------------|------------|-----------------|-----|-----------|
| 1 | 2K | 500 | $50 | $0 | $0 | $0 | **$50** |
| 2 | 3K | 800 | $150 | $100 | $0 | $0 | **$250** |
| 3 | 5K | 1.2K | $300 | $200 | $200 | $0 | **$700** |
| 4 | 8K | 2K | $500 | $400 | $500 | $0 | **$1,400** |
| 5 | 12K | 3K | $700 | $600 | $800 | $200 | **$2,300** |
| 6 | 15K | 4K | $900 | $800 | $1,000 | $500 | **$3,200** |

### Break-Even Milestones
| Target | When | Requires |
|--------|------|----------|
| **$500/mo** | Month 3 | 5K MAU, 1K subs, 1 sponsor |
| **$1,000/mo** | Month 4 | 8K MAU, 2K subs, 1 display sponsor |
| **$2,000/mo** | Month 5 | 12K MAU, 3K subs, active sponsor pipeline |
| **$5,000/mo** | Month 8-10 | 25K MAU, 8K subs, 2-3 sponsors + API customers |

---

*Analysis based on codebase review of current infrastructure (10 file reads), existing pricing data registry (16 models, 7 providers), and market benchmarks.*
