# 90-Day Growth Plan: Content & Distribution

**Status**: ACTIVE
**Start Date**: 2026-02-10
**End Date**: 2026-05-10
**Motto**: "Stop Building. Start Verifying."

## The Pivot

We are shifting from **Engineering Mode** (building features) to **Publisher Mode** (building authority). The product is technically superior; the bottleneck is now distribution.

## Core Pillars

### 1. The Manifesto (Authority)

Write and publish the definitive guide on LLM Cost Calculation.

- **Title**: "How We Calculate LLM Total Cost of Ownership (Open Source Methodology)"
- **Format**: Long-form, technical, mathematical. No marketing fluff.
- **Goal**: Reach frontpage of Hacker News or r/LocalLLaMA.
- **CTA**: "Check the Calculator" (soft) + "Get Price Alerts" (secondary).

### 2. Data Moat Activation (Utility)

Turn our internal data into a public asset.

- **Action**: Expose `price-history.json` via a clean, documented URL.
- **Messaging**: "The only open-source, historical pricing dataset for LLMs."
- **Distribution**: Submit to HuggingFace Datasets, Kaggle, PapersWithCode.

### 3. "Surgical" Distribution (Traffic)

- **Reddit Strategy**: Monitor r/LocalLLaMA, r/OpenAI, r/LLMDev. Reply to pricing questions with _data_ from our engine, not just links.
- **Twitter/X**: Weekly "Price Drop Alert" screenshots (using our own tool).
- **SEO**: Leverage the 3 new Micro-Tools (`/tools/*`) for long-tail keywords.

## Engineering Freeze 🥶 (with Nuance)

**ALLOWED (Distribution Code)**:

- **Newsletter Rebrand** (~6h): Transform transactional emails into "The LLM Price Index" brandable asset.
- **Model Detail Pages** (~12h): Programmatic SEO pages (`/models/gpt-4o`) to capture long-tail traffic.
- **Cron Job**: `check-price-shifts` (Already Live).
- **Data Updates**: `llm-pricing.json`.

**BLOCKED** (Do NOT Build):

- User Accounts / Auth.
- Saved Scenarios.
- Premium PDF / Stripe Integration.
- Sponsor Infrastructure.
- API Monetization.

## Metrics that Matter (North Star)

Ignore "Pageviews". Focus on **Signals of Value**:

1.  **Verified Emails**: Target 500 (Current: ~50).
2.  **Return Rate**: > 20% (Users coming back to check prices).
3.  **Backlinks**: Quality links from GitHub repos, University papers, or AI blogs.

## Timeline

- **Feb 10 - Feb 16**: Draft Manifesto + Newsletter Rebrand (~6h code).
- **Feb 17 - Feb 23**: Publish Manifesto + Hacker News "Show HN" Launch.
- **Feb 24 - Mar 10**: Model Detail Pages (~12h code) + First Reddit data posts.
- **Mar 11 - Apr 10**: Reddit "Helpful Commenter" Campaign + Weekly Price Analysis.
- **Apr 11 - May 10**: Evaluate traction.
  - _If success (>500 subs)_: Consider Sponsorships.
  - _If failure_: Re-evaluate Value Proposition.
