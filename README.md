# LLM Cost Engine v1.0

> Enterprise-grade Total Cost of Ownership (TCO) analysis for LLM deployments. Compare GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro with deterministic methodology.

[![Angular](https://img.shields.io/badge/Angular-19-dd0031?style=flat-square&logo=angular)](https://angular.dev)
[![SSR](https://img.shields.io/badge/SSR-Enabled-green?style=flat-square)](https://angular.dev/guide/ssr)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

## Overview

LLM Cost Engine is a deterministic calculator designed for enterprise procurement decisions. It provides:

- **Real-time TCO calculations** with Angular Signals
- **Deterministic ValueScore algorithm** for objective vendor comparison
- **Sensitivity Analysis** (2x/3x traffic projections)
- **Export signed PDF reports** for CTO/CFO approval
- **Deep linking** with URL parameter support for SEO

## ValueScore Algorithm

The core ranking mechanism balances cost efficiency with model capability:

```
ValueScore = (1 / MonthlyCost)^α × log₁₀(ContextWindow)^β × LatencyIndex
```

### Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **α (Alpha)** | 0.65 | Cost efficiency weight — primary driver (65%) |
| **β (Beta)** | 0.35 | Context capacity weight — diminishing returns (35%) |
| **LatencyIndex** | 0-1 | Linear multiplier penalizing slower models |

### Rationale

- **α = 0.65**: Cost savings are the primary driver for ROI decisions. Lower operational costs significantly boost the ValueScore.
- **β = 0.35**: Context window uses logarithmic scaling. Larger windows are valuable but show diminishing returns at enterprise scale.
- **LatencyIndex**: Linear penalty ensures we don't recommend cheap but slow models that impact user experience.

### Configuration

Weights are stored in `src/app/core/constants/engine-weights.ts` for easy modification:

```typescript
export const VALUESCORE_ALPHA = 0.65;
export const VALUESCORE_BETA = 0.35;
```

## Cost Calculation Formulas

### Daily Costs

**Input Cost (Non-Cached):**
```
C_input_nc = (M × Ti × (1 - Cr)) / 1,000,000 × P_input
```

**Input Cost (Cached):**
```
C_input_c = (M × Ti × Cr) / 1,000,000 × P_cached
```

**Output Cost:**
```
C_output = (M × To) / 1,000,000 × P_output
```

### Monthly Total
```
Cost_monthly = (C_input_nc + C_input_c + C_output) × 30
```

### Variables

| Variable | Description |
|----------|-------------|
| M | Messages per day |
| Ti | Input tokens per message |
| To | Output tokens per message |
| Cr | Cache hit rate (0.00 - 1.00) |
| P_input | Price per 1M input tokens |
| P_cached | Price per 1M cached input tokens |
| P_output | Price per 1M output tokens |

## URL Parameters (Deep Linking)

The tool supports URL parameter hydration for SEO and sharing:

```
/?m=5000&ti=200&to=400&cr=30
```

| Parameter | Description | Range |
|-----------|-------------|-------|
| `m` | Messages per day | 100 - 100,000 |
| `ti` | Input tokens | 50 - 5,000 |
| `to` | Output tokens | 50 - 10,000 |
| `cr` | Cache hit rate (%) | 0 - 100 |

### Example URLs

- Startup MVP: `/?m=500&ti=150&to=300&cr=20`
- Enterprise: `/?m=50000&ti=150&to=250&cr=45`
- Dev Productivity: `/?m=1000&ti=800&to=1200&cr=15`

## Architecture

```
src/app/
├── core/
│   ├── constants/
│   │   └── engine-weights.ts    # α, β parameters
│   ├── configs/
│   │   └── seo-presets.ts       # Programmatic SEO presets
│   ├── services/
│   │   ├── json-ld.service.ts   # Schema.org SEO
│   │   └── pricing-data.service.ts  # TransferState SSR
│   └── utils/
│       └── scenario-id.ts       # LLM-YYYY-XXXX generator
├── engines/
│   └── chatbot-simulator/
│       ├── logic.service.ts     # Core calculation logic
│       ├── chatbot-simulator.component.ts
│       └── chatbot-simulator.component.html
└── app.config.ts                # SSR hydration config
```

## Technical Stack

- **Framework**: Angular 19 (Standalone Components, Signals)
- **SSR**: Angular Universal with TransferState
- **Styling**: Tailwind CSS v4
- **Data**: JSON registry (`public/data/llm-pricing.json`)

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Zero CLS** | Fixed card dimensions, skeleton placeholders |
| **TransferState** | SSR data cached, no client re-fetch |
| **Hydration** | `provideClientHydration(withEventReplay())` |
| **Lazy Loading** | Simulator component loaded on demand |
| **Tabular Numbers** | `font-variant-numeric: tabular-nums` |

## Scenario ID

Each simulation generates a unique, traceable ID:

```
LLM-2026-A7F3
```

Format: `LLM-{YEAR}-{HASH}`

The hash is derived from simulation parameters for reproducibility. This ID is included in exported PDFs for procurement audit trails.

## How It Helps Procurement

1. **Objective Comparison**: Deterministic algorithm removes vendor bias
2. **Audit Trail**: Scenario IDs link analyses to procurement decisions
3. **Sensitivity Analysis**: Shows cost projections at 2x/3x traffic
4. **Signed Reports**: PDF exports formatted for CTO/CFO review
5. **Reproducibility**: URL parameters enable exact state recreation

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
npm run start
```

### Build

```bash
npm run build
```

### Production Bundle

```
Browser (gzip)
├── Initial: ~91 kB
├── Lazy: ~11 kB
└── CSS: ~4.7 kB
```

## Pricing Data

Model pricing is stored in `public/data/llm-pricing.json`:

```json
{
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "OpenAI",
      "pricing": {
        "input_1m": 2.50,
        "output_1m": 10.00,
        "cached_input_1m": 1.25
      },
      "capabilities": {
        "context_window": 128000,
        "latency_index": 0.85
      }
    }
  ]
}
```

## License

MIT License — See [LICENSE](LICENSE) for details.

---

Built with Angular 19 and deterministic methodology for enterprise decision-making.
