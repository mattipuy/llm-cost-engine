# API Integration Guide

## Overview

This guide explains how to integrate LLM Cost Engine's pricing data and calculation logic into your applications.

---

## Public Data Endpoints

### Pricing Data

**URL**: `https://llm-cost-engine.vercel.app/data/llm-pricing.json`

Returns current LLM pricing for all tracked models.

```bash
curl -s https://llm-cost-engine.vercel.app/data/llm-pricing.json | jq '.models[0]'
```

**Response Structure**:
```json
{
  "metadata": {
    "version": "1.2.0",
    "last_verified": "2026-01-31",
    "base_currency": "USD"
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

### Price History

**URL**: `https://llm-cost-engine.vercel.app/data/price-history.json`

Returns historical pricing snapshots for trend analysis.

```bash
curl -s https://llm-cost-engine.vercel.app/data/price-history.json | jq '.metadata'
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Fetch current pricing
async function getLLMPricing() {
  const response = await fetch(
    'https://llm-cost-engine.vercel.app/data/llm-pricing.json'
  );
  return response.json();
}

// Calculate monthly cost
function calculateCost(model, inputs) {
  const { messagesPerDay, tokensInput, tokensOutput, cacheRate } = inputs;
  const { pricing } = model;

  const cachedPrice = pricing.cached_input_1m ?? pricing.input_1m;

  const inputCost = (messagesPerDay * tokensInput * (1 - cacheRate) * pricing.input_1m) / 1_000_000;
  const cachedCost = (messagesPerDay * tokensInput * cacheRate * cachedPrice) / 1_000_000;
  const outputCost = (messagesPerDay * tokensOutput * pricing.output_1m) / 1_000_000;

  return (inputCost + cachedCost + outputCost) * 30;
}

// Example usage
const pricing = await getLLMPricing();
const gpt4o = pricing.models.find(m => m.id === 'gpt-4o');

const cost = calculateCost(gpt4o, {
  messagesPerDay: 1000,
  tokensInput: 500,
  tokensOutput: 200,
  cacheRate: 0.3
});

console.log(`Monthly cost: $${cost.toFixed(2)}`);
```

### Python

```python
import requests

def get_llm_pricing():
    url = "https://llm-cost-engine.vercel.app/data/llm-pricing.json"
    response = requests.get(url)
    return response.json()

def calculate_monthly_cost(model, inputs):
    pricing = model["pricing"]
    M = inputs["messages_per_day"]
    Ti = inputs["tokens_input"]
    To = inputs["tokens_output"]
    Cr = inputs["cache_rate"]

    cached_price = pricing.get("cached_input_1m", pricing["input_1m"])

    input_cost = (M * Ti * (1 - Cr) * pricing["input_1m"]) / 1_000_000
    cached_cost = (M * Ti * Cr * cached_price) / 1_000_000
    output_cost = (M * To * pricing["output_1m"]) / 1_000_000

    return round((input_cost + cached_cost + output_cost) * 30, 2)

# Example
data = get_llm_pricing()
gpt4o = next(m for m in data["models"] if m["id"] == "gpt-4o")

cost = calculate_monthly_cost(gpt4o, {
    "messages_per_day": 1000,
    "tokens_input": 500,
    "tokens_output": 200,
    "cache_rate": 0.3
})

print(f"Monthly cost: ${cost}")
```

### cURL + jq

```bash
# Get cheapest model for high-volume workloads
curl -s https://llm-cost-engine.vercel.app/data/llm-pricing.json | \
  jq '.models | sort_by(.pricing.output_1m) | .[0] | {name, provider, output_price: .pricing.output_1m}'

# List all providers
curl -s https://llm-cost-engine.vercel.app/data/llm-pricing.json | \
  jq '[.models[].provider] | unique'

# Filter models by context window > 200k
curl -s https://llm-cost-engine.vercel.app/data/llm-pricing.json | \
  jq '.models | map(select(.capabilities.context_window > 200000)) | .[].name'
```

---

## Rate Limits & Caching

- **No rate limits** on public JSON endpoints
- **Cache TTL**: Data is updated weekly; consider caching for 24 hours
- **CORS**: Enabled for all origins

### Recommended Caching Strategy

```typescript
const CACHE_KEY = 'llm-pricing-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getCachedPricing() {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const fresh = await fetch('https://llm-cost-engine.vercel.app/data/llm-pricing.json')
    .then(r => r.json());

  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: fresh,
    timestamp: Date.now()
  }));

  return fresh;
}
```

---

## Webhook Notifications (Coming Soon)

Subscribe to price change notifications:

```bash
# Register webhook (planned feature)
curl -X POST https://llm-cost-engine.vercel.app/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["price_change", "new_model"],
    "models": ["gpt-4o", "claude-3.5-sonnet"]
  }'
```

---

## Attribution

When using LLM Cost Engine data, please include attribution:

```html
<!-- HTML -->
<p>Pricing data by <a href="https://llm-cost-engine.vercel.app">LLM Cost Engine</a></p>
```

```markdown
<!-- Markdown -->
Pricing data by [LLM Cost Engine](https://llm-cost-engine.vercel.app)
```

---

## Support

- **Issues**: https://github.com/mattipuy/llm-cost-engine/issues
- **Discussions**: https://github.com/mattipuy/llm-cost-engine/discussions

---

*Data accuracy disclaimer: Pricing is point-in-time and should be verified against official provider sources for production decisions.*
