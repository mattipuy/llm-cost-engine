# Implementation Plan: LLM Context Window Visualizer

## Spec Reference
`docs/specs/06-context-window.md` + Claude review notes

## Files to Create
1. `src/app/engines/context-window/context-window-logic.service.ts`
2. `src/app/engines/context-window/context-window.component.ts`
3. `src/app/engines/context-window/context-window.component.html`

## Files to Modify
1. `src/app/app.routes.ts` - Add `/tools/context-window`
2. `src/app/engines/caching-roi/caching-roi.component.html` - Update "Coming soon" to real link

## Logic

### Inputs
- contentSize: number (default: 30000)
- unit: 'tokens' | 'words' | 'pages' (default: 'tokens')
- sortBy: 'price' | 'size' (default: 'price')

### Conversion
- words -> tokens: * 1.33
- pages -> tokens: * 665 (500 words * 1.33)

### Per-model calculation
- normalizedTokens = convert(contentSize, unit)
- isValid = context_window >= normalizedTokens
- usagePercent = (normalizedTokens / context_window) * 100
- overflowAmount = max(0, normalizedTokens - context_window)
- inputCost = (normalizedTokens / 1_000_000) * model.pricing.input_1m

### Output Interface
```typescript
interface ContextWindowResult {
  modelId: string;
  modelName: string;
  provider: string;
  contextWindow: number;
  isValid: boolean;
  usagePercent: number;
  overflowTokens: number;
  inputCost: number;      // Cost to process this specific input once
  pricePerMillion: number; // For display
}
```

### Sorting
- 'price': valid models first (sorted by inputCost ASC), then invalid (sorted by contextWindow DESC)
- 'size': sorted by contextWindow DESC

## UI
- Input sticky top: size slider + unit toggle + sort toggle
- Horizontal bar chart: one row per model
  - Green bar: fits (width = usagePercent of that model's context)
  - Red bar: overflow
  - "Fits!" / "Overflow" chip
  - Cost badge: "$0.14 per input"
- If all overflow: message "No model supports this size directly. Consider splitting/RAG."

## Review Notes Integrated
- Cost for specific input (not generic $/1M): `inputCost = tokens / 1M * input_1m`
- Sort by calculated cost (not raw input_1m) for correctness
- No output token field (keep simple - user wants "does it fit?")

## Success Criteria
- [ ] Green/Red visualization clear
- [ ] Unit conversion correct (Words, Pages)
- [ ] Sorting instant (Signals computed)
- [ ] Lighthouse 100/100 (very light page)
- [ ] ng build passes
