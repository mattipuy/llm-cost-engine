# Implementation Plan: Batch API Cost Calculator

## Spec Reference
`docs/specs/07-batch-api.md` + Claude review notes

## Prerequisites (from review)
The JSON registry needs `batch_input_1m` and `batch_output_1m` fields.
Only OpenAI and Anthropic have Batch APIs (both 50% discount).

## Files to Create
1. `src/app/engines/batch-api/batch-api-logic.service.ts`
2. `src/app/engines/batch-api/batch-api.component.ts`
3. `src/app/engines/batch-api/batch-api.component.html`

## Files to Modify
1. `public/data/llm-pricing.json` - Add batch pricing fields
2. `src/app/engines/chatbot-simulator/logic.service.ts` - Add batch fields to ModelPricing interface
3. `src/app/app.routes.ts` - Add `/tools/batch-api`
4. Cross-links in chatbot-simulator, caching-roi, context-window

## Batch Pricing Data (verified)
### OpenAI (50% off real-time)
- GPT-4o: batch_input $1.25, batch_output $5.00
- GPT-4o Mini: batch_input $0.075, batch_output $0.30
- o1: batch_input $7.50, batch_output $30.00
- o3-mini: batch_input $0.55, batch_output $2.20

### Anthropic (50% off real-time)
- Claude 3.5 Sonnet: batch_input $1.50, batch_output $7.50
- Claude 3.5 Haiku: batch_input $0.40, batch_output $2.00
- Claude Sonnet 4: batch_input $1.50, batch_output $7.50
- Claude Opus 4: batch_input $7.50, batch_output $37.50

### Others: No batch API (Google, DeepSeek, Meta, Mistral)

## Logic

### Inputs
- model: select (only batch-capable models)
- records: number (default: 10000)
- avgInputTokens: number (default: 500)
- avgOutputTokens: number (default: 100)

### Calculation
```typescript
const totalInput = records * avgInputTokens;
const totalOutput = records * avgOutputTokens;

const costRealTime = (totalInput / 1M) * input_1m + (totalOutput / 1M) * output_1m;
const costBatch = (totalInput / 1M) * batch_input_1m + (totalOutput / 1M) * batch_output_1m;

const savings = costRealTime - costBatch;
const savingsPercent = (savings / costRealTime) * 100;
const costPerRecord = costBatch / records;
const batchDiscount = (1 - batch_input_1m / input_1m) * 100; // for display
```

### Review Improvements Integrated
- Per-model batch pricing from JSON (not hardcoded 50%)
- Batch discount derived from data
- Cost per record for quick reference
- Edge case: small savings < $0.01 warning
- Trade-off visualization: time vs money

## UI
- Input: Model selector + records slider + avg tokens sliders
- Results (sticky): Big savings card, cost comparison table, cost per record
- Trade-off: "Real-time: Instant | Batch: ~24 hours"
- Edge case message for tiny savings

## Success Criteria
- [ ] JSON updated with batch pricing
- [ ] ModelPricing interface updated
- [ ] Calculator correct for OpenAI + Anthropic
- [ ] Trade-off 24h clearly shown
- [ ] ng build passes
