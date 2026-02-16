# Hacker News Launch Post - READY TO PUBLISH

**Post Type**: Show HN
**Target Audience**: Developers, CTOs, founders building LLM-powered products
**Timing**: Weekday morning (Tue-Thu, 8-10am PST optimal)
**Estimated Reach**: 5-10K views if front-page, 500-1K votes target

---

## 🎯 PRIMARY POST (Recommended)

**Title** (57 chars - under 60 limit):
```
Show HN: LLM Cost Engine – Neutral pricing calculator
```

**Body** (300 words max - keep it concise):

```
After the 5th time manually comparing GPT vs Claude vs Gemini pricing for a client project, I built LLM Cost Engine [1] – a neutral pricing calculator with 0 affiliate links.

Why "neutral"? Every other comparison site pushes affiliate deals. I wanted ONE place that just does math:

• 15 production LLMs (OpenAI, Anthropic, Google, DeepSeek, Mistral)
• 4 calculators (chatbot TCO, batch API, caching ROI, context fit)
• Historical pricing data (tracking the DeepSeek disruption in real-time)
• Weekly price drop alerts (≥5% threshold, double opt-in)

Fun insights I discovered while building:

• Claude's 90% cache discount is 2x better than competitors (10x cost reduction for static prompts)
• DeepSeek V3 at $0.27/1M is cheaper than a latte ☕ (seriously disrupting Western pricing)
• Gemini's 1M context is mostly marketing (99% of use cases need <200K)
• Output tokens cost 4-5x more than input – your chatbot's response length matters more than you think

Tech: Angular 19 SSR (100/100 Lighthouse), Supabase, Tailwind. Weekly snapshots via GitHub Actions.

What I'm NOT doing:
❌ Affiliate links
❌ Paid tiers
❌ "Recommended" badges that manipulate rankings
✅ Just data, deterministic math, open methodology

The full formula is here [2]. If you disagree with the weights, fork the math.

Looking for feedback on:
- Is the UI clear? (especially batch API calculator)
- Missing models you'd want tracked?
- Any pricing errors? (we verify weekly but mistakes happen)

Try it: [1]
Methodology: [2]
Repo: [3] (pricing data is public JSON)

[1] https://llm-cost-engine.com
[2] https://llm-cost-engine.com/blog/how-we-calculate-llm-tco
[3] https://github.com/YOUR_GITHUB_USER/llm-cost-engine (TODO: Add if repo public)
```

---

## 📊 ALTERNATIVE POST (More Technical)

**Title**:
```
Show HN: I open-sourced the math behind LLM cost rankings
```

**Body** (Shorter, formula-focused):

```
Most LLM cost calculators show $/1M tokens and call it a day. That's not your monthly bill.

I built [1] to calculate real TCO with deterministic math:

Cost = (M × Ti × (1-Cr) × P_input + M × Ti × Cr × P_cached + M × To × P_output) × 30

Where:
- M = messages/day
- Ti/To = tokens in/out
- Cr = cache hit rate
- P_* = pricing per 1M tokens

ValueScore = (1/Cost)^0.65 × log10(Context)^0.35 × Latency

The weights (0.65, 0.35) are named constants in the code [2]. No hidden logic, no vendor bias.

15 models tracked. Price drops ≥5% trigger automated alerts. All pricing data public JSON.

What it does: TCO calculator, batch API ROI, caching savings, context fit
What it doesn't: Quality benchmarks, rate limit modeling, latency tests

Built because I kept seeing "GPT-4 is cheap!" posts ignoring that output costs 4x input.

Try it: [1]
Formula breakdown: [2]

[1] https://llm-cost-engine.com
[2] https://llm-cost-engine.com/blog/how-we-calculate-llm-tco
```

---

## 🎨 SCREENSHOT PREP (Do Before Posting)

**Critical screenshots to prepare:**

1. **Hero Screenshot** (1200x630 OG image):
   - Chatbot Simulator with GPT-4o vs Claude comparison
   - Show ValueScore ranking + monthly cost breakdown
   - Must look clean on Twitter/HN preview

2. **Demo GIF** (optional but recommended):
   - Slider interaction → cost updates in real-time
   - Shows responsiveness and polish

3. **Results Table Screenshot**:
   - Full comparison of 5 models side-by-side
   - Highlights cost differences dramatically

**Tools**:
- Screenshot: macOS Cmd+Shift+4
- GIF: LICEcap or Kap
- Resize/crop: Preview or Figma

---

## 💬 COMMENT STRATEGY

**First Comment (Post immediately after submission):**

```
Author here. Happy to answer questions about the methodology or data sources.

Quick stats:
- 15 models tracked across 6 providers
- Weekly automated snapshots since Q4 2025
- ~12 weeks of historical pricing data
- All data sourced from official provider pricing pages

Biggest surprise building this: Anthropic's 90% cache discount is insane. For a support chatbot with static system prompts, Claude can be 5-10x cheaper than the $/1M table suggests.

Also tracking the DeepSeek impact – they dropped to $0.27/1M in December and forced GPT-4 Mini to respond (rumored $0.25 → $0.20 drop coming).

Tech stack: Angular 19 + Signals for reactivity, SSR for SEO, Supabase for price alerts. 100/100 Lighthouse score.

Ask me anything!
```

---

## 🚨 COMMON HN OBJECTIONS & RESPONSES

### "Why not use X provider's calculator?"
> Most provider calculators only show their own models. I wanted cross-provider comparison with historical tracking. Also, they don't account for caching discounts properly.

### "This is just affiliate marketing disguised as a tool"
> Zero affiliate links. I make $0 from this. Considering subtle sponsor badges in the future (like "Powered by Vercel") but never anything that changes rankings.

### "Your ValueScore weights are arbitrary"
> Fair criticism. The 0.65/0.35 split is based on "cost matters most for a cost calculator" but it's subjective. That's why the weights are named constants you can change. Fork the logic if you disagree.

### "Missing model X"
> Send me the model ID + official pricing page and I'll add it in the next weekly update. Currently tracking mainstream production models only (no preview/beta).

### "Latency index is outdated"
> Correct. I source latency from provider docs + Artificial Analysis. If you have better data, I'm happy to update.

### "This competes with Artificial Analysis"
> Different focus. They do quality + latency benchmarks (live testing). I do cost + historical pricing. Both tools serve different needs.

---

## 📈 SUCCESS METRICS

**Front Page Goals** (if trending):
- [ ] 500+ upvotes
- [ ] 100+ comments
- [ ] 5K+ unique visitors (Plausible dashboard)
- [ ] 50+ email signups (price alerts)
- [ ] 10+ GitHub stars (if repo public)

**Engagement Goals**:
- [ ] Respond to every question within 2 hours (first 6 hours critical)
- [ ] Address concerns transparently (no defensiveness)
- [ ] Update post with corrections if pricing errors found

**Follow-up Actions** (if successful):
- [ ] Post on Reddit r/MachineLearning, r/LocalLLaMA next day
- [ ] X thread with key insights (screenshot comparisons)
- [ ] ProductHunt launch (wait 1 week after HN)

---

## ⏰ POSTING CHECKLIST

**Pre-Launch** (30 min before):
- [ ] All tests passing (see TEST_CHECKLIST.md)
- [ ] Analytics configured (Plausible receiving events)
- [ ] Email alerts tested (send test alert, verify receipt)
- [ ] Screenshots prepared (hero + demo GIF ready)
- [ ] Blog post live at /blog/how-we-calculate-llm-tco
- [ ] All 15 model landing pages working (/models/gpt-4o, etc.)

**Launch Moment**:
- [ ] Post to HN (use PRIMARY POST above)
- [ ] Immediately add first comment (see COMMENT STRATEGY)
- [ ] Monitor for first 2 hours (respond to every question)
- [ ] Share on X with link back to HN thread

**Post-Launch** (24h monitoring):
- [ ] Check Plausible hourly (traffic spike expected)
- [ ] Verify email alerts working (check Supabase logs)
- [ ] Fix any bugs reported in comments ASAP
- [ ] Update pricing if errors found (transparency++)

---

## 🎯 RISK MITIGATION

**Potential Criticisms**:
1. **"Data is wrong"** → Verify sources immediately, fix transparently
2. **"Tool is slow"** → Already 100/100 Lighthouse, but monitor performance
3. **"Missing key feature"** → Add to roadmap publicly, don't over-promise
4. **"Affiliate suspicion"** → Point to code, public JSON, zero tracking cookies

**Emergency Response**:
- If pricing error found: Fix within 30 min, comment on HN with update
- If server down: Vercel auto-scales, but have Uptime Robot alert ready
- If negative comments: Respond calmly, fix if valid, explain if not

---

**STATUS**: ✅ Ready to Launch
**Recommended Timing**: Tuesday or Wednesday, 9am PST
**Backup Plan**: If <50 upvotes in 2h, re-post Thursday with different title

**Good luck! 🚀**
