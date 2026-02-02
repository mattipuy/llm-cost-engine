# LLM Cost Engine

**Enterprise TCO Analysis for AI Deployments**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-19-dd0031.svg)](https://angular.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)

---

## Overview

LLM Cost Engine is a **community-driven benchmark** for LLM TCO (Total Cost of Ownership).
Unlike simple cost calculators, it establishes a deterministic **ValueScore™** standard to compare model efficiency.

The core engine is open-source to ensure transparency and reproducibility.
We started with the "Big 3" (GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet) to establish a stable baseline.

**Mission**: To replace "vibe-based" model selection with engineering metrics.

### Key Features

### Key Features

- **ValueScore Algorithm**: Opinionated, deterministic scoring framework that balances cost efficiency against capability metrics
- **Multi-Provider Comparison**: Side-by-side analysis of OpenAI, Anthropic, Google, and 50+ other providers
- **Deterministic Methodology**: Every output is traceable to a mathematical formula—no black-box heuristics
- **Enterprise Simulation**: Model annual costs across varying token volumes and use cases
- **Prompt Caching Support**: Accurate cost modeling with provider-specific cache hit rates
- **Audit-Ready Exports**: Generate signed PDF reports suitable for internal technical review

---

## Table of Contents

1. [Overview](#overview)
2. [ValueScore Formula](#valuescore-formula)
3. [Live Demo](#live-demo)
4. [Cost Calculation](#cost-calculation)
5. [Sensitivity Analysis](#sensitivity-analysis)
6. [URL Parameters](#url-parameters)
7. [Tech Stack](#tech-stack)
8. [Getting Started](#getting-started)
9. [API Reference](#api-reference)
10. [Data Ownership & Usage](#data-ownership--usage)
11. [Contributing](#contributing)
12. [License](#license)

---

## ValueScore Formula

The ValueScore algorithm provides a single, comparable metric across all LLM providers:

$$ValueScore = \left(\frac{1}{Cost}\right)^\alpha \times \log_{10}(ContextWindow)^\beta \times LatencyIndex$$

**Where:**

- **Cost** = Monthly blended cost (input/output weighted with caching)
- **ContextWindow** = Maximum context length in tokens
- **LatencyIndex** = Normalized response time score (0.0-1.0)
- **alpha = 0.65** (cost weight)
- **beta = 0.35** (context weight)

### Weight Rationale

| Weight           | Factor           | Justification                                     |
| ---------------- | ---------------- | ------------------------------------------------- |
| **alpha = 0.65** | Cost Efficiency  | Primary ROI driver; hard budget constraints       |
| **beta = 0.35**  | Context Capacity | Diminishing returns at scale; logarithmic benefit |
| **Linear**       | Latency Index    | User experience penalty; disqualifies slow models |

### Formula Rationale

Why `log10(Context)`?

- **Diminishing Returns**: Going from 8k to 32k context is a massive operational unlock (4x). Going from 1M to 4M is niche (4x). The logarithmic scale penalizes small context severely but prevents massive context (Gemini 1.5) from skewing the score disproportionately against efficient models (GPT-4o).

Why `LatencyIndex` is linear?

- **User Experience**: Latency is felt linearly. A 500ms delay is noticeable; a 2s delay is painful. We treat speed as a direct multiplier of value.

These parameters are configurable in `src/app/core/constants/engine-weights.ts`.

### Deterministic Methodology

Every calculation in LLM Cost Engine follows these principles:

1. **No AI Guessing**: All outputs derive from explicit formulas in the source code
2. **Auditable Inputs**: Pricing data sourced from official provider documentation
3. **Reproducible Results**: Given identical inputs, the engine produces identical outputs
4. **Version-Controlled Data**: Registry changes are tracked with timestamps for historical comparison

### Edge Cases

- If `Cost_monthly = 0`, substitute epsilon = 0.0001 to prevent division by zero
- If `ContextWindow` is missing, default to 8,000 tokens
- If `LatencyIndex` is missing, default to 0.5

### Interpretation

### Limitations (The "Fine Print")

We value transparency over hype. This model has known constraints:

1.  **Output Quality Agnostic**: The engine assumes "sufficient quality". It does not penalize hallucination rates or reasoning capabilities.
2.  **Throughput Variance**: Latency is modeled as a static index, not a dynamic distribution. Real-world Token/s varies by load.
3.  **Public Rates Only**: Enterprise negotiated rates (EDP) are not reflected multiple.

### Disclaimer

> **Not Financial Advice**: This tool provides a deterministic simulation based on public pricing. It is an engineering artifact, not a procurement guarantee. Verify all prices with official provider documentation before signing contracts.

---

## Preview

![Enterprise TCO Report](assets/preview-report.png)

> **Engineering-Grade Reports**: Generate signed, audit-ready PDF reports directly from the tool for internal alignment.

---

## Live Demo

Experience the full platform at: **[https://llm-cost-engine.vercel.app](https://llm-cost-engine.vercel.app)**

### Preset Scenarios

| Scenario         | URL                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Startup MVP      | [?m=500&ti=150&to=300&cr=20](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=500&ti=150&to=300&cr=20)     |
| SaaS Growth      | [?m=5000&ti=200&to=400&cr=30](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=5000&ti=200&to=400&cr=30)   |
| Enterprise       | [?m=50000&ti=150&to=250&cr=45](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=50000&ti=150&to=250&cr=45) |
| Dev Productivity | [?m=1000&ti=800&to=1200&cr=15](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=1000&ti=800&to=1200&cr=15) |

---

## Cost Calculation

### Input Variables

| Variable         | Symbol | Description                      | Default |
| ---------------- | ------ | -------------------------------- | ------- |
| Messages per day | M      | Daily API call volume            | 500     |
| Input tokens     | T_i    | Tokens per request (prompt)      | 150     |
| Output tokens    | T_o    | Tokens per response (completion) | 300     |
| Cache hit rate   | C_r    | Fraction of cached prompts       | 0.20    |

### Formulas

**Daily Input Cost (Non-Cached):**

$$C_{input\_nc} = \frac{M \times T_i \times (1 - C_r)}{1{,}000{,}000} \times P_{input}$$

**Daily Input Cost (Cached):**

$$C_{input\_c} = \frac{M \times T_i \times C_r}{1{,}000{,}000} \times P_{cached}$$

**Daily Output Cost:**

$$C_{output} = \frac{M \times T_o}{1{,}000{,}000} \times P_{output}$$

**Monthly Total (30 days):**

$$Cost_{monthly} = (C_{input\_nc} + C_{input\_c} + C_{output}) \times 30$$

Where:

- P_input = Price per 1M input tokens
- P_cached = Price per 1M cached input tokens
- P_output = Price per 1M output tokens

---

## Sensitivity Analysis

The engine projects costs at scaled traffic levels:

$$Cost_{2x} = Cost_{monthly}(M \times 2, T_i, T_o, C_r)$$

$$Cost_{3x} = Cost_{monthly}(M \times 3, T_i, T_o, C_r)$$

This enables planning for growth scenarios without re-running the full analysis.

### Annual Projections

$$Cost_{annual} = Cost_{monthly} \times 12$$

---

## URL Parameters

Every simulation state is addressable via URL for deep linking and SEO:

```
/tools/chatbot-simulator?m=50000&ti=150&to=250&cr=45
```

| Parameter | Maps To        | Range       | Default |
| --------- | -------------- | ----------- | ------- |
| `m`       | Messages/day   | 100-100,000 | 500     |
| `ti`      | Input tokens   | 50-5,000    | 150     |
| `to`      | Output tokens  | 50-10,000   | 300     |
| `cr`      | Cache rate (%) | 0-100       | 20      |

### Canonical URLs

Each parameter combination generates a unique canonical URL, enabling:

- Programmatic SEO (thousands of indexable pages)
- Shareable simulation states
- Reproducible analysis for procurement

---

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Frontend       | Angular 19 (Standalone Components, Signals)           |
| Rendering      | Server-Side Rendering (SSR) + TransferState           |
| Edge Functions | Vercel Edge Runtime                                   |
| Language       | TypeScript 5.x                                        |
| Styling        | Tailwind CSS v4                                       |
| Data Layer     | JSON Registries (`public/data/llm-pricing.json`)      |

### Architecture

```
src/app/
├── core/
│   ├── constants/
│   │   └── engine-weights.ts      # alpha, beta parameters
│   ├── configs/
│   │   └── seo-presets.ts         # Indexed scenario presets
│   ├── services/
│   │   ├── json-ld.service.ts     # Schema.org metadata
│   │   └── pricing-data.service.ts # SSR TransferState
│   └── utils/
│       └── scenario-id.ts         # LLM-YYYY-XXXX generator
├── engines/
│   └── chatbot-simulator/
│       ├── logic.service.ts       # Core calculations
│       ├── chatbot-simulator.component.ts
│       └── chatbot-simulator.component.html
└── app.config.ts                  # Angular SSR config
```

### Bundle Analysis

| Chunk            | Size (gzip) |
| ---------------- | ----------- |
| Initial          | ~91 kB      |
| Lazy (simulator) | ~12 kB      |
| CSS              | ~5 kB       |

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/mattipuy/llm-cost-engine.git
cd llm-cost-engine

# Install dependencies
npm install

# Start development server
npm run start
```

### Contributing (Community Models)

We explicitly invite the community to extend the benchmark.
Do you believe **DeepSeek-V3** or **Llama-3-70b** offers better TCO? Prove it.

1.  **Fork** the repo.
2.  Add your model to `src/assets/data/llm-pricing.json`.
3.  **Open a PR** with the title: `feat: add [ModelName] to benchmark`.

_Note: We strictly control the "Big 3" baseline, but the "Community Choice" slot is open for monthly rotation._

### Build for Production

```bash
# Production build with SSR
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## API Reference

### Market Insights Endpoint

```
GET /api/insights
```

Returns aggregated market simulation data including:

- Average monthly token consumption by tier
- Provider distribution across enterprise accounts
- Cost optimization recommendations

**Response Format:**

```json
{
  "timestamp": "2026-01-31T00:00:00Z",
  "insights": {
    "avgMonthlyTokens": 125000000,
    "topProviders": ["openai", "anthropic", "google"],
    "costTrend": -0.12
  }
}
```

> Note: Detailed Market Insights data is currently in **Alpha collection phase**. Aggregated benchmarks will be released in Q3 2026. See [Data Ownership](#data-ownership--usage) section.

---

## Roadmap

We are building the standard for LLM Cost Analysis. Here is where we are going:

- [ ] **Quality Weighting**: Optional parameter to penalize models with higher hallucination rates (community-sourced).
- [ ] **Throughput Modeling**: Dynamic latency modeling based on real-time token/s benchmarks.
- [ ] **Historical Price Tracking**: Time-series view of price drops to visualize deflationary trends.
- [ ] **Enterprise Profiles**: Custom weight configurations for specific organizational needs (e.g. "Security First").

---

## Data Ownership & Usage

This project operates under a **hybrid licensing model**:

### Source Code (MIT License)

The application source code is released under the MIT License. You are free to:

- Use the code for commercial and non-commercial purposes
- Modify and distribute the code
- Create derivative works

See the [LICENSE](LICENSE) file for full terms.

### Market Insights Data (Proprietary)

The aggregated simulation data collected through the Market Insights API (`/api/insights`) is **proprietary and NOT released under MIT**. This data represents:

- Curated market intelligence from enterprise deployments
- Anonymized usage patterns and cost benchmarks
- Trend analysis derived from platform interactions

Commercial use of Market Insights data requires a separate license agreement.

### LLM Pricing Data (Attribution Required)

The `llm-pricing.json` pricing data is provided as-is for educational and research purposes. Requirements for use:

- **Personal/Educational**: Free to use with attribution
- **Commercial Redistribution**: Requires explicit attribution to LLM Cost Engine
- **Data Accuracy**: Pricing is point-in-time and should be verified against official provider sources

---

## Contributing

We welcome contributions to the LLM Cost Engine. Please follow these guidelines:

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with descriptive messages
4. Ensure all tests pass (`npm run test`)
5. Submit a pull request

### Data Contributions

For updates to the LLM Registry pricing data:

1. Provide official source documentation (pricing pages, API docs)
2. Include the effective date of the pricing
3. Submit via pull request with sources linked in the PR description

### Code Standards

- Follow Angular style guide conventions
- Use Signals for all reactive state
- Never hardcode pricing—use JSON registry
- All calculations must be deterministic and documented

---

## License

This project uses a hybrid licensing model:

- **Source Code**: [MIT License](LICENSE)
- **Market Insights Data**: Proprietary (contact for licensing)
- **LLM Registry Data**: Free with attribution for non-commercial use

Copyright (c) 2026 LLM Cost Engine Contributors

---

## Changelog

**v1.0.0** (2026-01-31)

- Initial Release.
- Added: GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro.
- Feature: Deep Linking & Programmatic SEO.
- Feature: ValueScore™ Algorithm.

---

## References

### Specification

See [docs/specs/01-chatbot-simulator.md](docs/specs/01-chatbot-simulator.md) for the full technical specification.

---

<sub>Built with Angular 19 | Deterministic methodology for enterprise decision-making</sub>
