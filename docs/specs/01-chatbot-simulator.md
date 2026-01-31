# Specification: Chatbot Cost Simulator (01)

**Version**: 1.0.0
**Status**: Draft
**Author**: Architect & Product Manager (Gemini)
**Implementer**: Lead Developer (Claude Code)

## 1. Overview

A deterministic tool to estimate monthly operating costs for LLM-based customer service chatbots. It benchmarks top-tier models (GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet) and calculates a standardized **ValueScore** to recommend the most efficient model.

## 2. Business Logic (Deterministic)

### 2.1 Inputs (User Variables)

| Variable | Description                  | Default    |
| :------- | :--------------------------- | :--------- |
| `M`      | Messages per day             | 500        |
| `Ti`     | Input tokens per message     | 150        |
| `To`     | Output tokens per message    | 300        |
| `Cr`     | Cache Hit Rate (0.00 - 1.00) | 0.20 (20%) |

### 2.2 Cost Calculation Formulas

Reference pricing from `src/assets/data/llm-pricing.json`.

**1. Daily Input Cost (Non-Cached):**
$$ C*{input_nc} = \frac{M \times T_i \times (1 - C_r)}{1,000,000} \times P*{input_1m} $$

**2. Daily Input Cost (Cached):**
$$ C*{input_c} = \frac{M \times T_i \times C_r}{1,000,000} \times P*{cached_1m} $$

**3. Daily Output Cost:**
$$ C*{output} = \frac{M \times T_o}{1,000,000} \times P*{output_1m} $$

**4. Monthly Total Cost (30 days):**
$$ Cost*{monthly} = (C*{input_nc} + C*{input_c} + C*{output}) \times 30 $$

### 2.3 ValueScore Formula

A normalized metric to balance cost, context capacity, and latency.

$$ ValueScore = \left( \frac{1}{Cost*{monthly}} \right)^{\alpha} \times (\log*{10}(ContextWindow))^{\beta} \times LatencyIndex $$

_Parameters (Default): $\alpha = 0.65$ (Cost Sensitivity), $\beta = 0.35$ (Context Sensitivity)._

_Note: If `Cost_{monthly}` is 0, use a minimal epsilon value (e.g., 0.0001) to avoid division by zero.\_

## 3. Comparative Logic: `explainScore()`

The system must interpret the `ValueScore` difference between the selected model and the best-performing model.

**Function Definition (Pseudo-code):**

```typescript
/**
 * Explains the "why" behind the score difference.
 * @param currentModel The model currently in focus or selected.
 * @param bestModel The model with the highest ValueScore.
 */
function explainScore(currentModel: ModelParams, bestModel: ModelParams): string {
  if (currentModel.id === bestModel.id) {
    return "This model is the #1 Best Value choice for your volume.";
  }

  // Calculate raw cost difference
  const costDiff = currentModel.monthlyCost - bestModel.monthlyCost;

  if (costDiff > 0) {
    // Current model is more expensive
    return `Operating this model costs $${costDiff.toFixed(2)} more/mo than ${bestModel.name}. Ensure the Latency/Context justifies the premium.`;
  } else {
    // Current model is cheaper but lower score (likely due to latency or context limits)
    return `${currentModel.name} is cheaper, but ${bestModel.name} scores higher due to better Latency Index or Context Window.`;
  }
}
```

### 3.1 Aggressive Comparison (Winner vs Runner-Up)

To support the "High-Performance" brand positioning, we explicitly calculate the dominance of the Winner over the Runner-up (2nd best ValueScore).

**Formulas:**

**1. Cost Savings:**
$$ Savings*{\%} = \frac{Cost*{runnerUp} - Cost*{winner}}{Cost*{runnerUp}} \times 100 $$
_Narration_: "Switching to [Winner] saves you X% monthly compared to [Runner-Up]."

**2. Context Dominance:**
$$ Context*{multiplier} = \frac{Context*{winner}}{Context\_{runnerUp}} $$
_Narration_: "[Winner] offers Xx more context memory than [Runner-Up]." (Only display if > 1.0)

This logic drives the "Why Switch" argument directly in the UI.

## 4. Implementation Requirements

- **File Location**: `src/app/engines/chatbot-simulator/logic.ts`
- **Data Source**: Import strictly from `src/assets/data/llm-pricing.json`.
- **Latency Attributes**:
  - Ensure `llm-pricing.json` has `capabilities.latency_index` (0.0 - 1.0, where 1.0 is fastest/best).

## 5. UI/UX (Claude Code)

- **Visuals**: Display `ValueScore` as a progress bar or gauge.
- **Interactive**: Toggling `Cache Hit Rate` must immediately update the `Cost_{monthly}` and recalculate the winner.

## 6. Feature: PDF TCO Analysis Report (Lead Magnet)

To capture high-intent leads, users can export a detailed **Total Cost of Ownership (TCO)** validation report.

### 6.1 Report Structure (Table of Contents)

The PDF must be auto-generated with the following sections:

1.  **Executive Summary**: The final "Winner" recommendation and projected annual variance vs. key competitors.
2.  **Scenario Analysis**: Improving accuracy by documenting the input assumptions ($M$, $Ti$, $To$, $Cr$).
3.  **Model Benchmarking**: A comparative table of all analyzed models (Cost/Month, Latency, Context).
4.  **Sensitivity Analysis**: A chart showing how cost changes if traffic ($M$) doubles or triples.
5.  **Case Studies**: Real-world positioning comparisons for similar usage patterns.
6.  **Implementation Guide**: Quick JSON config snippet to use the winning model.

### 6.2 Data Payload (Frontend -> Backend)

The frontend must send this JSON to the `/api/generate-report` endpoint:

```json
{
  "userEmail": "engineer@company.com",
  "simulationId": "uuid-v4",
  "persistenceId": "v1_procurement_trace_abcdef123",
  "reportType": "TCO_ANALYSIS_V1",
  "inputs": {
    "messagesPerDay": 500,
    "tokens": { "input": 150, "output": 300 },
    "cacheRate": 0.2
  },
  "results": {
    "winnerId": "gemini-1.5-pro",
    "savingsVsRunnerUp": 14.5,
    "annualProjectedCost": 1250.0
  }
}
```

### 6.3 UI/Micro-copy (Capture Box)

**UX Flow**: The "Export" button is always visible. Clicking it opens the Email Capture Modal.
**Style**: Minimalist, Terminal-like. No marketing fluff.
**Headline**: `Export TCO Analysis`
**Body**: `Generate a signed PDF compliant with procurement standards. Includes sensitivity analysis and JSON config.`
**Placeholder**: `user@corp.com`
**Button**: `[GENERATE .PDF]`

## 7. feature: Programmatic SEO & Deep Linking

To dominate Long-Tail keywords (e.g., "Cost of 10k messages chatbot"), every state of the application must be addressable via URL.

### 7.1 URL Structure

The application must sync the URL Query Parameters 1:1 with the Signals state.

**Pattern**: `/tools/chatbot-simulator`
**Query Parameters**:
| Param | Map to | Default | Example |
| :--- | :--- | :--- | :--- |
| `m` | `messagesPerDay` | 500 | `?m=10000` |
| `ti` | `inputTokens` | 150 | `?ti=500` |
| `to` | `outputTokens` | 300 | `?to=1000` |
| `cr` | `cacheRate` | 20 | `?cr=50` |

### 7.2 Canonical Strategy

- **Self-referencing Canonical**: If params are present, the canonical tag must reflect the full URL to signal Google to index this specific scenario.
- **Dynamic Meta Tags**:
  - **Title**: `Cost of [M] Daily Messages Chatbot: GPT-4o vs Gemini`
  - **Description**: `Calculate the monthly TCO for a chatbot handling [M] messages/day with [Ti] input tokens. Winner: [WinnerName].`
    - **Description**: `Calculate the monthly TCO for a chatbot handling [M] messages/day with [Ti] input tokens. Winner: [WinnerName].`

This architecture turns one tool into 10,000+ landing pages.

## 8. Feature: Analytics & Data Intelligence

To generate the "State of LLM Pricing 2026" report (Reddit/LinkedIn), we must track the simulation outcomes anonymously.

### 8.1 Privacy First (GDPR Constraint)

- **NO** User Agents, IP Addresses, or Fingerprints.
- **NO** User Emails (unless explicitly provided in the PDF export flow).
- **Metric**: Aggregate counters only.

### 8.2 Event Payload: `simulation_consensus`

Trigger this event when a simulation stabilizes (debounce 2s after last slider change).

```json
{
  "event_name": "simulation_consensus",
  "timestamp": "ISO_8601",
  "winner_id": "gemini-1.5-pro",
  "scenario_volume": 50000, // Segmentation: <1k (Startup), >10k (Scaleup), >50k (Enterprise)
  "cache_rate": 0.45, // Insight: Tech sophistication level
  "input_output_ratio": 0.6, // Insight: Workload type (Creation vs Analysis)
  "value_score": 0.0112,
  "competitor_gap_percent": 48.5
}
```

### 8.3 Market Segmentation Logic

The backend/analyst will classify events based on `scenario_volume`:

- **Startup**: < 5,000 msg/day
- **Scaleup**: 5,000 - 50,000 msg/day
- **Enterprise**: > 50,000 msg/day

### 8.3 Implementation Note

Use Vercel Web Analytics custom events or a lightweight `POST /api/telemetry` endpoint that writes to a non-relational store (e.g., Redis/KV).
