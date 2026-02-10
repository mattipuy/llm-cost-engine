# Implementation Plan: Prompt Caching ROI Calculator

## Spec Reference
`docs/specs/05-prompt-caching.md` + Claude review notes

## Files to Create
1. `src/app/engines/caching-roi/caching-roi-logic.service.ts` - Pure deterministic logic
2. `src/app/engines/caching-roi/caching-roi.component.ts` - Component with inline template
3. `src/app/engines/caching-roi/caching-roi.component.html` - Template (separate for maintainability)

## Files to Modify
1. `src/app/app.routes.ts` - Add `/tools/caching-roi` route

## Logic (from spec + review notes)

### Inputs
- selectedModelId: string (default: 'claude-3.5-sonnet')
- staticTokens: number (default: 5000, min: 100)
- dynamicTokens: number (default: 100, min: 1)
- outputTokens: number (default: 200, min: 1)
- requestsPerDay: number (default: 1000, min: 1)
- cacheWritePercent: number (default: 10, range: 1-100)

### Calculation
Per spec formula (Write/Read split):
- Cost_NoCache = Vol * ((Static + Dynamic) * P_input + Output * P_output)
- Cost_Cached = Writes*Static*P_input + Reads*Static*P_cached + Vol*Dynamic*P_input + Vol*Output*P_output
- Monthly_Savings = Cost_NoCache - Cost_Cached
- Savings_Percent = (Monthly_Savings / Cost_NoCache) * 100

### Review Note Additions
- **Annual Savings** = Monthly_Savings * 12
- **Break-even** = ceil(1 / writeRate) requests (after N requests, caching pays for itself)
- **Cache Discount %** = (1 - cached_input_1m / input_1m) * 100 (per model info display)

### Output Interface
```typescript
interface CachingRoiResult {
  costNoCache: number;       // Monthly without cache
  costCached: number;        // Monthly with cache
  monthlySavings: number;
  savingsPercent: number;
  annualSavings: number;     // Review note: enterprise audience
  breakEvenRequests: number; // Review note: "After N requests, caching pays off"
  cacheDiscount: number;     // Display: "This model offers X% cache discount"
}
```

## UI Structure
- Single responsive card (max-w-5xl centered)
- Mobile: stacked (inputs top, results bottom)
- Desktop: 2 columns (inputs left, sticky results right)
- Results: Big savings number, comparison bar, break-even callout, annual projection
- Bell icon on selected model for Price Alert
- Cross-links in footer: Chatbot Simulator, Context Window (future)

## SEO
- Route: `/tools/caching-roi`
- Title: "Prompt Caching ROI Calculator - Estimate Savings for Claude & Gemini"
- JSON-LD: SoftwareApplication
- Dynamic meta based on selected model

## Success Criteria
- [ ] Only models with cached_input_1m shown in selector
- [ ] Write/Read split calculation matches spec formula
- [ ] Break-even and annual savings displayed
- [ ] Mobile responsive, no horizontal scroll
- [ ] Dynamic meta tags per selected model
- [ ] ng build passes
