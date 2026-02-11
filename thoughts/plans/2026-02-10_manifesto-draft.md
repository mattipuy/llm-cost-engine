# We Open-Sourced the Math Behind LLM Cost Rankings

*16 models. 7 providers. Weekly price tracking. Here's the formula.*

---

Every LLM provider shows you $/1M tokens.

That number looks precise. It isn't.

**$/1M tokens is not your monthly cost. It's a unit price detached from workload reality.**

The difference between those two can be thousands of dollars per year. GPT-4o at $2.50/1M input looks cheap until you run 10,000 messages a day with 500-token outputs at $10.00/1M -- and suddenly you're at $2,250/month.

Most teams only discover this after the invoice arrives.

We built [LLM Cost Engine](https://llm-cost-engine.vercel.app) to calculate real monthly costs, deterministically. No opinions, no hidden weights, no vendor deals.

This is the exact math we use.

---

## The Cost Formula

Four inputs, three price dimensions, one deterministic output.

```
M  = Messages per day
Ti = Input tokens per message
To = Output tokens per message
Cr = Cache hit rate (0.00 - 1.00)

Daily cost:
  C_input_fresh  = (M × Ti × (1 - Cr)) / 1,000,000 × P_input
  C_input_cached = (M × Ti × Cr)       / 1,000,000 × P_cached
  C_output       = (M × To)            / 1,000,000 × P_output

Monthly cost = (C_input_fresh + C_input_cached + C_output) × 30
```

That's it. This is the exact formula in our codebase. Every number in the calculator traces back to this math.

### Why Input/Output Separation Matters

Most calculators treat all tokens equally. They shouldn't.

| Model | Input $/1M | Output $/1M | Ratio |
|-------|-----------|-------------|-------|
| GPT-4o | $2.50 | $10.00 | **4x** |
| Claude Opus 4 | $15.00 | $75.00 | **5x** |
| Gemini 2.0 Flash | $0.10 | $0.40 | **4x** |

Output tokens cost 4-5x more than input across every major model. A chatbot generating long responses has a fundamentally different cost profile than a pipeline extracting short JSON. We separate them because real workloads aren't symmetric.

### The Cache Variable

Prompt caching discounts are the most overlooked cost lever in LLM pricing:

| Model | Standard Input | Cached Input | Discount |
|-------|---------------|-------------|----------|
| Claude 3.5 Sonnet | $3.00 | $0.30 | **90%** |
| Gemini 2.0 Flash | $0.10 | $0.025 | **75%** |
| DeepSeek V3 | $0.27 | $0.07 | **74%** |
| GPT-4o | $2.50 | $1.25 | **50%** |

A support bot with a static system prompt hitting 80% cache rate pays dramatically less than one with dynamic prompts. If a model doesn't publish a cached price, we fall back to the standard input price. No assumptions.

---

## ValueScore: Deterministic Ranking

Cost alone doesn't determine the best model. A model at $0.01/month with an 8K context window and 3-second latency isn't "best value."

```
ValueScore = (1 / Cost)^0.65 × log10(Context)^0.35 × LatencyIndex
```

Three factors. Fixed weights. No manual overrides.

| Factor | Weight | Rationale |
|--------|--------|-----------|
| `(1 / Cost)^0.65` | 65% | This is a cost calculator. Cost dominates. |
| `log10(Context)^0.35` | 35% | Context matters, but 1M vs 2M is marginal. Log scale captures diminishing returns. |
| `LatencyIndex` | 0-1 multiplier | Sourced from benchmarks. Fast models score higher. |

The weights are named constants in a source file you can read: `VALUESCORE_ALPHA = 0.65`, `VALUESCORE_BETA = 0.35`. Not buried in logic. Intentionally transparent.

**What ValueScore does NOT do:**
- Measure output quality, reasoning, or coding ability
- Use subjective assessments or crowdsourced ratings
- Change based on who sponsors us (nobody does)

If two people enter the same inputs, they get the same ranking. Always.

---

## Deterministic > Opinion

This is our design principle.

Benchmarking tools that hide their methodology ask you to trust them. We'd rather show you the math.

- The pricing dataset is public JSON: [`llm-pricing.json`](https://llm-cost-engine.vercel.app/data/llm-pricing.json)
- The ValueScore formula is four lines of TypeScript
- The weights are named constants, not magic numbers
- If you disagree with `ALPHA = 0.65`, fork the logic and set your own

A tool that produces different rankings depending on who is paying it isn't a tool -- it's an ad.

---

## Routing: The 80/20 Strategy

Not every query needs your most expensive model. Route 80% to GPT-4o Mini, 20% to Claude Sonnet:

```
($4.50 × 0.80) + ($13.50 × 0.20) = $6.30/mo  vs  $13.50/mo = 53% savings
```

Our simulator calculates this for any pair of models in the registry, in real-time.

---

## Price Tracking: Weekly, Automated, Public

We snapshot all 16 models' pricing every Sunday via automated cron. Every change is recorded -- even increases.

When a price drops >= 5%, subscribers get an automatic digest email. No account needed, just an email address with double opt-in.

The pricing dataset, detection logic, and alert threshold are public. Nothing is hidden behind an API.

---

## What We Don't Do

1. **No live latency benchmarking.** Our latency index comes from provider docs and third-party data, not our own measurements. [Artificial Analysis](https://artificialanalysis.ai) does this better.

2. **No output quality evaluation.** ValueScore is a cost metric, not a capability benchmark. Always test with your actual prompts.

3. **No vendor partnerships.** We don't receive compensation from any LLM provider. All pricing is sourced from official pages and verified weekly.

4. **No rate limit modeling.** The cheapest model might throttle at 1,000 RPM. We don't capture this.

Transparency requires admitting what you don't measure.

---

## Try It

If you're making model decisions based on pricing tables alone, you're likely underestimating real deployment cost.

Calculator: [llm-cost-engine.vercel.app](https://llm-cost-engine.vercel.app)

Enter your workload. Compare up to 5 models. Enable routing. Run sensitivity at 2x and 3x.

If you disagree with the weights, fork the math.

---

*Pricing data: v1.3.0, 16 models, 7 providers. Sourced from official pricing pages, verified 2026-02-08. Updated weekly.*
