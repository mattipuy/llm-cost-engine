# LLM Cost Engine

**Enterprise TCO Analysis for AI Deployments**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-19-dd0031.svg)](https://angular.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)

---

## Overview

LLM Cost Engine is a deterministic cost analysis platform designed for enterprise procurement teams evaluating Large Language Model providers. The tool delivers CFO-ready TCO (Total Cost of Ownership) reports with transparent, reproducible calculations.

### Key Features

- **ValueScore Algorithm**: Proprietary scoring system that balances cost efficiency against capability metrics
- **Multi-Provider Comparison**: Side-by-side analysis of OpenAI, Anthropic, Google, and 50+ other providers
- **Deterministic Methodology**: Every output is traceable to a mathematical formula—no black-box heuristics
- **Enterprise Simulation**: Model annual costs across varying token volumes and use cases
- **Prompt Caching Support**: Accurate cost modeling with provider-specific cache hit rates
- **CFO-Ready Exports**: Generate signed PDF reports suitable for internal procurement approval

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

| Weight | Factor | Justification |
|--------|--------|---------------|
| **alpha = 0.65** | Cost Efficiency | Primary ROI driver; hard budget constraints |
| **beta = 0.35** | Context Capacity | Diminishing returns at scale; logarithmic benefit |
| **Linear** | Latency Index | User experience penalty; disqualifies slow models |

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

Higher ValueScore = better value proposition. The model with the highest score is recommended.

---

## Preview

![Enterprise TCO Report](assets/preview-report.png)

> **CFO-Ready Reports**: Generate signed, CFO-ready PDF reports directly from the tool for internal procurement approval.

---

## Live Demo

Experience the full platform at: **[https://llm-cost-engine.vercel.app](https://llm-cost-engine.vercel.app)**

### Preset Scenarios

| Scenario | URL |
|----------|-----|
| Startup MVP | [?m=500&ti=150&to=300&cr=20](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=500&ti=150&to=300&cr=20) |
| SaaS Growth | [?m=5000&ti=200&to=400&cr=30](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=5000&ti=200&to=400&cr=30) |
| Enterprise | [?m=50000&ti=150&to=250&cr=45](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=50000&ti=150&to=250&cr=45) |
| Dev Productivity | [?m=1000&ti=800&to=1200&cr=15](https://llm-cost-engine.vercel.app/tools/chatbot-simulator?m=1000&ti=800&to=1200&cr=15) |

---

## Cost Calculation

### Input Variables

| Variable | Symbol | Description | Default |
|----------|--------|-------------|---------|
| Messages per day | M | Daily API call volume | 500 |
| Input tokens | T_i | Tokens per request (prompt) | 150 |
| Output tokens | T_o | Tokens per response (completion) | 300 |
| Cache hit rate | C_r | Fraction of cached prompts | 0.20 |

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

| Parameter | Maps To | Range | Default |
|-----------|---------|-------|---------|
| `m` | Messages/day | 100-100,000 | 500 |
| `ti` | Input tokens | 50-5,000 | 150 |
| `to` | Output tokens | 50-10,000 | 300 |
| `cr` | Cache rate (%) | 0-100 | 20 |

### Canonical URLs

Each parameter combination generates a unique canonical URL, enabling:
- Programmatic SEO (thousands of indexable pages)
- Shareable simulation states
- Reproducible analysis for procurement

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 19 (Standalone Components, Signals) |
| Rendering | Server-Side Rendering (SSR) + TransferState |
| Edge Functions | Vercel Edge Runtime |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 |
| Data Layer | JSON Registries (`src/assets/data/llm-registry.json`) |

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

| Chunk | Size (gzip) |
|-------|-------------|
| Initial | ~91 kB |
| Lazy (simulator) | ~12 kB |
| CSS | ~5 kB |

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

> Note: Detailed Market Insights data is proprietary. See [Data Ownership](#data-ownership--usage) section.

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

### LLM Registry (Attribution Required)

The `llm-registry.json` pricing data is provided as-is for educational and research purposes. Requirements for use:
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

## References

### Specification

See [docs/specs/01-chatbot-simulator.md](docs/specs/01-chatbot-simulator.md) for the full technical specification.

---

<sub>Built with Angular 19 | Deterministic methodology for enterprise decision-making</sub>
