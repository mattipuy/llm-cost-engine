# Contributing to LLM Cost Engine

**Mission**: We are building the engineering standard for LLM Cost Analysis. "Vibes" are not accepted here.

## The Benchmark Protocol

We welcome PRs that add new models, BUT they must meet the **Gold Standard**.
If you want to add `DeepSeek-V3`, you must prove the numbers.

### 1. Adding a New Model (`src/assets/data/llm-pricing.json`)

Your PR must include a JSON entry with:

- **Pricing**: Sourced directly from the official API pricing page (Link required).
- **Specs**: Context Window and Latency Index.
- **Verification**: If adding a "Latency Index", link to a third-party benchmark (e.g., Artificial Analysis) in the PR description.

**Rejection Criteria:**

- ❌ No source link for pricing.
- ❌ "Estimated" prices.
- ❌ Marketing claims without engineering backing.

### 2. Code Standards

- **Strict Types**: Do not use `any`.
- **Determinism**: All logic must be testable and reproducible.
- **No Analytics Changes**: The `AnalyticsService` logic is core/proprietary. Do not modify the event payloads.

## How to Submit

1.  **Fork** the repo.
2.  Create a branch: `feat/add-model-name`.
3.  Update `src/assets/data/llm-pricing.json`.
4.  Run `npm run test` (Price integrity check).
5.  Open a PR using the **Model Request Template**.

---

_By contributing, you agree that your code contributions are MIT licensed._
