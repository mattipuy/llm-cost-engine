# Open-Source TCO Calculator Specification

## Overview

This document specifies the core TCO (Total Cost of Ownership) calculation engine used by LLM Cost Engine. The algorithm is fully deterministic, reproducible, and designed for enterprise procurement workflows.

**Version**: 1.0.0
**License**: MIT (with attribution)
**Maintainer**: LLM Cost Engine Team

---

## Core Formulas

### 1. Daily Cost Calculation

The daily cost for an LLM deployment is calculated from three components:

```
Daily_Cost = C_input_nc + C_input_cached + C_output
```

Where:

| Variable | Formula | Description |
|----------|---------|-------------|
| `C_input_nc` | `(M × Ti × (1 - Cr)) / 1,000,000 × P_input` | Non-cached input tokens |
| `C_input_cached` | `(M × Ti × Cr) / 1,000,000 × P_cached` | Cached input tokens |
| `C_output` | `(M × To) / 1,000,000 × P_output` | Output tokens |

**Input Parameters:**

| Parameter | Symbol | Unit | Description |
|-----------|--------|------|-------------|
| Messages per day | `M` | count | Daily API call volume |
| Input tokens/message | `Ti` | tokens | Average input context size |
| Output tokens/message | `To` | tokens | Average response length |
| Cache hit rate | `Cr` | 0.0-1.0 | Fraction of cached prompts |

**Pricing Variables (per 1M tokens):**

| Variable | Description |
|----------|-------------|
| `P_input` | Standard input token price |
| `P_output` | Output token price |
| `P_cached` | Cached input token price |

### 2. Monthly Cost

```
Monthly_Cost = Daily_Cost × 30
```

Uses a standard 30-day billing month for consistency.

### 3. Annual Cost

```
Annual_Cost = Monthly_Cost × 12
```

---

## ValueScore™ Algorithm

The ValueScore ranks models by balancing cost efficiency with capability requirements.

### Formula

```
ValueScore = (1 / Monthly_Cost)^α × log₁₀(Context_Window)^β × Latency_Index
```

### Weights

| Weight | Symbol | Default | Rationale |
|--------|--------|---------|-----------|
| Cost Efficiency | α | 0.65 | Primary ROI driver (65% influence) |
| Context Capacity | β | 0.35 | Enterprise requirement (35% influence) |

### Component Breakdown

1. **Cost Factor**: `(1 / Monthly_Cost)^0.65`
   - Inverse relationship: lower cost = higher score
   - Exponent dampens extreme cost differences

2. **Context Factor**: `log₁₀(Context_Window)^0.35`
   - Logarithmic scale: diminishing returns at scale
   - Rewards models with larger context windows

3. **Latency Multiplier**: `Latency_Index` (0.0 - 1.0)
   - Linear multiplier penalizing slow models
   - Higher index = faster response times

### Edge Cases

| Condition | Handling |
|-----------|----------|
| Monthly_Cost = 0 | Use ε = 0.0001 to prevent division by zero |
| Context_Window missing | Default to 8,000 tokens |
| Latency_Index missing | Default to 0.5 |

---

## Sensitivity Analysis

Projects costs at different traffic levels for capacity planning.

```javascript
// Traffic multipliers
const scenarios = [
  { multiplier: 1, label: "Current" },
  { multiplier: 2, label: "Double" },
  { multiplier: 3, label: "Triple" }
];

// Calculate for each scenario
scenarios.forEach(s => {
  const projected_daily = Daily_Cost * s.multiplier;
  const projected_monthly = projected_daily * 30;
  const projected_annual = projected_monthly * 12;
});
```

---

## Reference Implementation

### TypeScript

```typescript
interface SimulatorInputs {
  messagesPerDay: number;      // M
  tokensInputPerMessage: number;  // Ti
  tokensOutputPerMessage: number; // To
  cacheHitRate: number;           // Cr (0.0-1.0)
}

interface ModelPricing {
  input_1m: number;      // P_input
  output_1m: number;     // P_output
  cached_input_1m?: number; // P_cached
}

interface ModelCapabilities {
  context_window: number;
  latency_index: number; // 0.0-1.0
}

function calculateMonthlyCost(
  inputs: SimulatorInputs,
  pricing: ModelPricing
): number {
  const { messagesPerDay: M, tokensInputPerMessage: Ti,
          tokensOutputPerMessage: To, cacheHitRate: Cr } = inputs;

  const cachedPrice = pricing.cached_input_1m ?? pricing.input_1m;

  // Daily costs
  const inputNonCached = (M * Ti * (1 - Cr) * pricing.input_1m) / 1_000_000;
  const inputCached = (M * Ti * Cr * cachedPrice) / 1_000_000;
  const output = (M * To * pricing.output_1m) / 1_000_000;

  const dailyTotal = inputNonCached + inputCached + output;
  return dailyTotal * 30;
}

function calculateValueScore(
  monthlyCost: number,
  capabilities: ModelCapabilities
): number {
  const ALPHA = 0.65;
  const BETA = 0.35;
  const EPSILON = 0.0001;

  const safeCost = monthlyCost === 0 ? EPSILON : monthlyCost;
  const contextWindow = capabilities.context_window || 8000;
  const latencyIndex = capabilities.latency_index || 0.5;

  const inverseCostFactor = Math.pow(1 / safeCost, ALPHA);
  const contextFactor = Math.pow(Math.log10(contextWindow), BETA);

  return inverseCostFactor * contextFactor * latencyIndex;
}
```

### Python

```python
import math
from dataclasses import dataclass
from typing import Optional

@dataclass
class SimulatorInputs:
    messages_per_day: int
    tokens_input: int
    tokens_output: int
    cache_hit_rate: float  # 0.0-1.0

@dataclass
class ModelPricing:
    input_1m: float
    output_1m: float
    cached_input_1m: Optional[float] = None

@dataclass
class ModelCapabilities:
    context_window: int
    latency_index: float

def calculate_monthly_cost(inputs: SimulatorInputs, pricing: ModelPricing) -> float:
    M = inputs.messages_per_day
    Ti = inputs.tokens_input
    To = inputs.tokens_output
    Cr = inputs.cache_hit_rate

    cached_price = pricing.cached_input_1m or pricing.input_1m

    input_non_cached = (M * Ti * (1 - Cr) * pricing.input_1m) / 1_000_000
    input_cached = (M * Ti * Cr * cached_price) / 1_000_000
    output = (M * To * pricing.output_1m) / 1_000_000

    daily_total = input_non_cached + input_cached + output
    return round(daily_total * 30, 2)

def calculate_value_score(
    monthly_cost: float,
    capabilities: ModelCapabilities,
    alpha: float = 0.65,
    beta: float = 0.35
) -> float:
    EPSILON = 0.0001

    safe_cost = monthly_cost if monthly_cost > 0 else EPSILON
    context_window = capabilities.context_window or 8000
    latency_index = capabilities.latency_index or 0.5

    inverse_cost_factor = (1 / safe_cost) ** alpha
    context_factor = math.log10(context_window) ** beta

    return round(inverse_cost_factor * context_factor * latency_index, 4)
```

---

## Pricing Data Schema

```json
{
  "metadata": {
    "version": "1.2.0",
    "last_verified": "2026-01-31",
    "base_currency": "USD",
    "pricing_unit": "per_1M_tokens"
  },
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
        "latency_index": 0.95
      }
    }
  ]
}
```

---

## Usage Guidelines

### Attribution Required

When using this algorithm in your projects, include:

```
TCO calculation methodology by LLM Cost Engine
https://llm-cost-engine.vercel.app
```

### Customization Points

| Parameter | Default | Recommended Range |
|-----------|---------|-------------------|
| α (cost weight) | 0.65 | 0.5 - 0.8 |
| β (context weight) | 0.35 | 0.2 - 0.5 |
| Billing days/month | 30 | 28 - 31 |

### Validation

To verify your implementation, use these test vectors:

```javascript
// Test Case 1: Standard workload
const inputs = {
  messagesPerDay: 1000,
  tokensInputPerMessage: 500,
  tokensOutputPerMessage: 200,
  cacheHitRate: 0.3
};

const pricing = {
  input_1m: 2.50,
  output_1m: 10.00,
  cached_input_1m: 1.25
};

// Expected monthly cost: ~$79.12
// (verify within ±0.5% tolerance)
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-31 | Initial public specification |

---

## Contributing

Found an error or have suggestions? Open an issue at:
https://github.com/mattipuy/llm-cost-engine/issues

---

*This specification is provided "as-is" for educational and research purposes. Always verify calculations against official provider pricing before making procurement decisions.*
