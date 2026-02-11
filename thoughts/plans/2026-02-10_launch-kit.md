# Launch Kit: Manifesto Distribution

**Date**: 2026-02-10
**Source**: ChatGPT (Content Strategist)
**Status**: Ready to execute

---

## HN Submission

**Title**: `Show HN: We Open-Sourced the Math Behind LLM Cost Rankings (16 Models, Weekly Tracking)`

**Initial comment** (post immediately after submission):

```
Hi HN,

I built LLM Cost Engine because I kept seeing teams compare models using $/1M tokens — which doesn't translate to real monthly cost.

This project:

- Tracks pricing for 16 models across 7 providers (weekly snapshots)
- Calculates full monthly TCO based on workload parameters
- Separates input/output/cached pricing
- Uses a deterministic ValueScore (65% cost, 35% log context, latency multiplier)
- Exposes the pricing dataset as public JSON
- Makes the ranking formula fully transparent (no hidden weights)

The full methodology is explained here:
https://llm-cost-engine.vercel.app/blog/how-we-calculate-llm-tco

If you disagree with the weights or ranking logic, you can fork the math. The goal isn't to claim "correctness" — it's to make the assumptions visible.

Happy to answer technical questions.
```

---

## Reddit r/LocalLLaMA

**Title**: `We open-sourced the math behind LLM cost rankings (full formula + public pricing JSON)`

**Body**:

```
I've been tracking API pricing across 16 models (OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral) and noticed almost everyone compares just $/1M tokens.

The problem: that's a unit price, not a real monthly cost.

I published:

- The full TCO calculation formula (input/output/cache separated)
- The deterministic ranking algorithm (65% cost, 35% log context, latency multiplier)
- The public JSON with prices updated weekly
- The automated price snapshot system

Full methodology:
https://llm-cost-engine.vercel.app/blog/how-we-calculate-llm-tco

Question for the community:
If you were to change the weights (0.65 / 0.35), what would you adjust and why?

Curious about technical feedback.
```

---

## Pre-Written Responses to Critical Comments

### "0.65 and 0.35 are arbitrary"

```
You're right — they are opinionated.

But they're fixed, documented, and visible.

The point isn't that 0.65 is "objectively true."
The point is that the weighting is transparent and deterministic.

If someone prefers a context-heavy workload, they can change the weights
and see the ranking shift immediately.

Hidden weights are worse than debatable ones.
```

### "You don't measure quality, so ranking is meaningless"

```
Correct — ValueScore is not a capability benchmark.

It's a cost-efficiency metric.

We explicitly avoid subjective quality scoring because that tends to
become opaque and vendor-influenced.

The goal is to isolate cost dynamics from capability debates.

Teams should always validate output quality with their own prompts.
```

### "This looks like affiliate marketing"

```
There are no vendor partnerships and no ranking overrides.

The pricing JSON is public.
The formula is public.
The weights are constants in the code.

If a model becomes cheaper tomorrow, the ranking changes automatically.

Given the same inputs and dataset, anyone can reproduce the same output.

That was the core design principle.
```

---

## Publishing Strategy

**When**: Tuesday or Wednesday, 14:30-16:30 CET (8:30-10:30 US Eastern)
**Stay online**: 2 hours minimum, reply to comments within 5-10 minutes
**Tone**: Technical, calm, non-defensive. Zero marketing language.

**Order**:
1. Publish on own domain (the blog route)
2. Immediately: HN Show HN submission
3. Same day or next: Reddit r/LocalLLaMA post
4. Reply to every comment

**Do NOT**:
- Say "subscribe"
- Mention monetization or sponsors
- Defend weights as absolute truth
- Argue

**Success criteria**:
- HN: 30+ upvotes = success, front page = home run
- Reddit: 50+ upvotes on r/LocalLLaMA
- Traffic: 1,000+ visitors day 1
- Signups: 200-400 price alert subscriptions
