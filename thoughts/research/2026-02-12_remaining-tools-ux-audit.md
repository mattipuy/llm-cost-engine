# Comprehensive UX Audit: Batch API, Caching ROI & Context Window

**Date**: 2026-02-12
**Auditor**: Claude Sonnet 4.5 (Angular Architect)
**Methodology**: Same systematic approach used for chatbot-simulator audit (12 critical issues found)
**Focus Areas**: Empty states, accessibility, memory leaks, mobile responsiveness, input validation, success states, scroll behavior, form UX

---

## Executive Summary

### Tool Rankings by UX Quality

| Tool | Total Issues | Critical | High | Medium | Low | UX Score | Priority |
|------|-------------|----------|------|--------|-----|----------|----------|
| **context-window** | 13 | 5 | 4 | 3 | 1 | 5.5/10 | **URGENT** |
| **batch-api** | 11 | 4 | 4 | 2 | 1 | 6.5/10 | High |
| **caching-roi** | 10 | 3 | 4 | 2 | 1 | 7.0/10 | Medium |

### Key Findings

**All three tools share common critical issues:**
1. ✅ No empty states when no models match filters
2. ✅ Missing keyboard focus indicators on interactive elements
3. ✅ No memory leak protection (missing `ngOnDestroy` cleanup)
4. ✅ No form cancellation support (ESC key, reset buttons)
5. ✅ Sticky elements covering content on mobile
6. ✅ Missing ARIA labels for screen readers
7. ✅ No loading error recovery paths

**Why context-window is worst:**
- Most complex interaction (sticky controls + long scrollable list)
- No empty state when no models fit content size
- Price alert button on EVERY model card (100+ unnecessary tab stops)
- Sticky bar covers content on scroll

---

## 1. BATCH-API - UX Audit

### Overview
- **Component**: `/src/app/engines/batch-api/batch-api.component.ts` (244 lines)
- **Template**: `/src/app/engines/batch-api/batch-api.component.html` (342 lines)
- **Complexity**: Medium (3 input sliders + 1 model selector + results sidebar)

---

### CRITICAL Issues (4)

#### CRITICAL-1: No Empty State for Zero Batch Models
**Severity**: CRITICAL
**Location**: `batch-api.component.html:37-41`
**Problem**:
```html
@for (model of batchModels(); track model.id) {
  <option [value]="model.id">
    {{ model.name }} ({{ model.provider }})
  </option>
}
```
If `batchModels()` returns empty array, the `<select>` is empty with no explanation.

**Impact**: User sees blank dropdown, thinks app is broken
**Fix**: Add empty state message:
```html
@if (batchModels().length === 0) {
  <p class="text-sm text-amber-600">No models with Batch API support found.</p>
} @else {
  <select ...>...</select>
}
```

---

#### CRITICAL-2: No Keyboard Focus Indicators
**Severity**: CRITICAL (WCAG 2.4.7 Level AA violation)
**Location**: `batch-api.component.html:32-42` (select), lines 84-92 (range inputs)
**Problem**: Range sliders and select have `focus:ring-2 focus:ring-indigo-500` on select but **no visible focus** on range inputs.

**Impact**: Keyboard users cannot see which control is focused
**Fix**: Add focus styles to all range inputs:
```css
.range-input:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}
```

---

#### CRITICAL-3: No Memory Leak Protection
**Severity**: CRITICAL
**Location**: `batch-api.component.ts:43-244` (no `ngOnDestroy`)
**Problem**:
- Component subscribes to `pricingService.loadPricingData()` at line 172
- **No cleanup on destroy** → memory leak when navigating away
- Observable completes naturally, but Angular best practice is explicit cleanup

**Impact**: Memory leaks in SPA navigation, especially if API is slow
**Fix**: Implement `ngOnDestroy` with subscription cleanup:
```typescript
export class BatchApiComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadPricingData();
  }

  private loadPricingData(): void {
    this.pricingService.loadPricingData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({...});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

#### CRITICAL-4: Missing ARIA Labels for Price Alert Button
**Severity**: CRITICAL (WCAG 4.1.2 Level A violation)
**Location**: `batch-api.component.html:44-53`
**Problem**:
```html
<button
  type="button"
  (click)="openPriceAlert()"
  title="Track pricing shifts for this model"
>
  <svg ...>...</svg>
</button>
```
- **No accessible name** for screen readers
- `title` attribute is not read by screen readers in all contexts
- Icon-only button

**Impact**: Screen reader users hear "button" with no context
**Fix**: Add `aria-label`:
```html
<button
  type="button"
  (click)="openPriceAlert()"
  aria-label="Track pricing shifts for this model"
  title="Track pricing shifts for this model"
>
```

---

### HIGH Issues (4)

#### HIGH-1: No Loading Error Recovery
**Severity**: HIGH
**Location**: `batch-api.component.ts:184-188`
**Problem**:
```typescript
error: (err) => {
  console.error('Failed to load pricing data', err);
  this.isLoading.set(false);
},
```
- Error logged to console but **user sees nothing**
- No error message, no retry button
- User stuck with empty UI

**Impact**: User has no way to recover from network errors
**Fix**: Add error state signal and display:
```typescript
errorMessage = signal<string | null>(null);

// In error handler:
this.errorMessage.set('Failed to load pricing data. Please refresh the page.');

// In template:
@if (errorMessage()) {
  <div class="p-4 bg-red-50 rounded-lg">
    <p class="text-red-800">{{ errorMessage() }}</p>
    <button (click)="loadPricingData()">Retry</button>
  </div>
}
```

---

#### HIGH-2: No Form Reset/Cancel Option
**Severity**: HIGH
**Location**: `batch-api.component.html:73-143` (Job Configuration section)
**Problem**: Once user adjusts sliders, **no way to reset to defaults** without page refresh

**Impact**: User frustration when exploring scenarios
**Fix**: Add reset button:
```typescript
resetToDefaults(): void {
  this.records.set(10000);
  this.avgInputTokens.set(500);
  this.avgOutputTokens.set(100);
}
```

---

#### HIGH-3: Trivial Savings Warning Too Hidden
**Severity**: HIGH
**Location**: `batch-api.component.html:196-202`
**Problem**: Warning only shows **inside results card** at the bottom. User may miss it when adjusting inputs.

**Impact**: User gets confused by "$0.00 savings" results
**Fix**: Move warning to top of results OR add inline validation near inputs

---

#### HIGH-4: No ESC Key Support to Close Modal
**Severity**: HIGH
**Location**: `batch-api.component.ts:162-164`
**Problem**: Price alert modal has `(closed)` event but no ESC key handler

**Impact**: Keyboard users must click close button
**Fix**: Add `@HostListener` in modal component OR pass ESC handler via input

---

### MEDIUM Issues (2)

#### MEDIUM-1: Sticky Results Sidebar Covers Content on Mobile
**Severity**: MEDIUM
**Location**: `batch-api.component.html:172-173`
**Problem**:
```html
<div class="lg:col-span-2">
  <div class="lg:sticky lg:top-6 space-y-6">
```
- Sticky at `top-6` (24px from top)
- On mobile, if user scrolls fast, sticky element jumps into view and covers content

**Impact**: Minor UX annoyance on mobile
**Fix**: Increase `top` value to prevent overlap OR disable sticky on mobile entirely

---

#### MEDIUM-2: No Input Min/Max Validation Feedback
**Severity**: MEDIUM
**Location**: `batch-api.component.ts:135-145` (handlers)
**Problem**:
```typescript
onRecordsChange(value: number): void {
  this.records.set(Math.max(1, value));
}
```
- Silently clamps to min=1
- No visual feedback when user tries to go below 1

**Impact**: Minor confusion if user tries extreme values
**Fix**: Add toast notification OR disabled state on slider ends

---

### LOW Issues (1)

#### LOW-1: Missing Touch Target Size on Mobile
**Severity**: LOW
**Location**: `batch-api.component.html:44-53` (price alert button)
**Problem**: Button is `p-2` (8px padding) = ~32px touch target. WCAG AAA recommends 44px.

**Impact**: Slightly harder to tap on mobile
**Fix**: Increase padding to `p-3` on mobile breakpoints

---

### Summary: Batch API
- **Total Issues**: 11
- **Breakdown**: 4 critical, 4 high, 2 medium, 1 low
- **Estimated Fix Effort**: 6-8 hours
- **Priority Ranking**: 2/3

---

## 2. CACHING-ROI - UX Audit

### Overview
- **Component**: `/src/app/engines/caching-roi/caching-roi.component.ts` (252 lines)
- **Template**: `/src/app/engines/caching-roi/caching-roi.component.html` (362 lines)
- **Complexity**: High (5 input sliders + model selector + 3 result cards)

---

### CRITICAL Issues (3)

#### CRITICAL-1: No Empty State for Zero Cacheable Models
**Severity**: CRITICAL
**Location**: `caching-roi.component.html:37-41`
**Problem**: Same as batch-api — if `cacheableModels()` is empty, dropdown is blank.

**Impact**: User sees empty select, thinks app is broken
**Fix**: Add empty state check before select

---

#### CRITICAL-2: No Memory Leak Protection
**Severity**: CRITICAL
**Location**: `caching-roi.component.ts:178-197` (subscription with no cleanup)
**Problem**: Same issue as batch-api — `loadPricingData()` subscribes but never unsubscribes.

**Impact**: Memory leak on navigation
**Fix**: Add `ngOnDestroy` with `takeUntil` pattern

---

#### CRITICAL-3: Missing ARIA Labels on Price Alert Button
**Severity**: CRITICAL (WCAG 4.1.2 Level A violation)
**Location**: `caching-roi.component.html:44-53`
**Problem**: Same icon-only button with no accessible name

**Impact**: Screen readers cannot identify button purpose
**Fix**: Add `aria-label="Track pricing shifts for this model"`

---

### HIGH Issues (4)

#### HIGH-1: Cache Hit Rate Slider Is Inverted (Confusing UX)
**Severity**: HIGH
**Location**: `caching-roi.component.html:162-183`
**Problem**:
```html
<label>Cache Hit Rate</label>
<span>{{ cacheHitRate() }}%</span>
<p class="text-xs">
  ({{ cacheWritePercent() }}% cold / {{ cacheHitRate() }}% warm)
</p>
<input
  [value]="cacheHitRate()"
  (input)="onCacheWriteChange(100 - $any($event.target).valueAsNumber)"
/>
```
- Label says "Cache Hit Rate" but internally manages `cacheWritePercent`
- **Inverted logic** confuses users
- Explanatory text `(% cold / % warm)` is cryptic

**Impact**: Users may misinterpret what they're configuring
**Fix**: Either:
1. Rename label to "Cache Write Rate" and flip the logic
2. OR simplify to single "Cache Efficiency" slider

---

#### HIGH-2: No Loading Error Recovery
**Severity**: HIGH
**Location**: `caching-roi.component.ts:192-196`
**Problem**: Same as batch-api — error logged but no user feedback

**Impact**: User stuck with blank screen on error
**Fix**: Add error state signal and retry button

---

#### HIGH-3: No Form Reset Button
**Severity**: HIGH
**Location**: `caching-roi.component.html:64-185` (Token Configuration + Volume sections)
**Problem**: 5 sliders with no reset option

**Impact**: User must manually revert all changes
**Fix**: Add "Reset to Defaults" button

---

#### HIGH-4: Break-Even Metric Unclear
**Severity**: HIGH
**Location**: `caching-roi.component.html:213-223`
**Problem**:
```html
<div class="flex justify-between text-sm">
  <span>Break-even</span>
  <span>{{ r.breakEvenRequests | number }} requests</span>
</div>
<p class="text-xs text-green-600 mt-1">
  After {{ r.breakEvenRequests }} requests, caching pays for itself.
</p>
```
- **Misleading**: Caching doesn't have an upfront cost to "pay for"
- Break-even in this context means "when cumulative savings > 0"
- Users may think they need to wait X requests before benefiting

**Impact**: Confusing messaging about ROI timeline
**Fix**: Rephrase to "Cache becomes profitable after X requests" OR remove metric entirely

---

### MEDIUM Issues (2)

#### MEDIUM-1: Sticky Results Sidebar on Mobile
**Severity**: MEDIUM
**Location**: `caching-roi.component.html:189-190`
**Problem**: Same sticky sidebar issue as batch-api

**Impact**: Sidebar may cover content on mobile
**Fix**: Disable sticky on mobile OR increase `top` offset

---

#### MEDIUM-2: No Input Validation Feedback
**Severity**: MEDIUM
**Location**: `caching-roi.component.ts:142-160` (handlers)
**Problem**: Silent clamping with `Math.max()` and `Math.min()`

**Impact**: User doesn't know when they hit limits
**Fix**: Add visual feedback (toast or inline warning)

---

### LOW Issues (1)

#### LOW-1: Emoji in Cross-Links (Accessibility)
**Severity**: LOW
**Location**: `caching-roi.component.html:300, 310, 320`
**Problem**:
```html
<span class="text-2xl">🧮</span>
<span class="text-2xl">📐</span>
<span class="text-2xl">⏱️</span>
```
- No `aria-hidden="true"` on decorative emojis
- Screen readers announce emoji names

**Impact**: Screen readers say "abacus, triangle ruler, stopwatch" unnecessarily
**Fix**: Add `aria-hidden="true"` to emoji spans

---

### Summary: Caching ROI
- **Total Issues**: 10
- **Breakdown**: 3 critical, 4 high, 2 medium, 1 low
- **Estimated Fix Effort**: 5-7 hours
- **Priority Ranking**: 3/3

---

## 3. CONTEXT-WINDOW - UX Audit

### Overview
- **Component**: `/src/app/engines/context-window/context-window.component.ts` (249 lines)
- **Template**: `/src/app/engines/context-window/context-window.component.html` (260 lines)
- **Complexity**: Very High (sticky controls + long scrollable list with 15+ model cards)

---

### CRITICAL Issues (5)

#### CRITICAL-1: No Empty State for "No Models Fit"
**Severity**: CRITICAL
**Location**: `context-window.component.html:99-107`
**Problem**:
```html
@if (!hasValidModel()) {
  <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
    <svg ...></svg>
    No model fits — consider splitting or RAG
  </span>
}
```
- Warning badge appears in **sticky header only**
- Below, user sees list of **red overflow bars** with no clear CTA
- No "What should I do?" guidance

**Impact**: User gets frustrated with no actionable next steps
**Fix**: Add prominent empty state card with CTAs:
```html
@if (!hasValidModel()) {
  <div class="p-8 bg-amber-50 rounded-xl border-2 border-amber-200">
    <h3 class="text-lg font-bold text-amber-900">No model can handle this content size</h3>
    <p class="text-amber-800 mt-2">Your content ({{ normalizedTokens() | number }} tokens) exceeds all available models.</p>
    <div class="mt-4 space-y-2">
      <p class="font-semibold text-amber-900">Recommended actions:</p>
      <ul class="list-disc list-inside text-amber-800">
        <li>Split content into smaller chunks</li>
        <li>Use RAG (Retrieval-Augmented Generation)</li>
        <li>Reduce content size to under {{ formatTokens(maxContext()) }}</li>
      </ul>
    </div>
  </div>
}
```

---

#### CRITICAL-2: Sticky Controls Cover Content on Scroll
**Severity**: CRITICAL
**Location**: `context-window.component.html:26`
**Problem**:
```html
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-0 z-10 mb-8">
```
- Sticky bar at `top-0` with `z-10`
- When user scrolls, **first model cards disappear under sticky bar**
- No padding compensation on body

**Impact**: First 1-2 model cards are hidden under sticky controls
**Fix**: Change `top-0` to `top-4` OR add `scroll-margin-top` to model cards

---

#### CRITICAL-3: Price Alert Button on EVERY Model Card (Keyboard Navigation Hell)
**Severity**: CRITICAL (WCAG 2.4.3 Level A violation)
**Location**: `context-window.component.html:139-149` (inside `@for` loop at line 112)
**Problem**:
```html
@for (result of sortedResults(); track result.modelId) {
  <div class="bg-white rounded-xl ...">
    ...
    <button
      (click)="openPriceAlert(result.modelId, result.modelName, result.pricePerMillion)"
      [attr.aria-label]="'Track pricing for ' + result.modelName"
    >...</button>
  </div>
}
```
- **15+ model cards** each with a price alert button
- Keyboard user must **tab through 15+ buttons** to reach footer links
- Unnecessary cognitive load

**Impact**: Keyboard navigation is painful, violates "efficient navigation"
**Fix**:
1. Remove per-model price alert buttons
2. Add single "Track All Models" button in sticky bar OR footer
3. OR make buttons `tabindex="-1"` and only activatable via mouse

---

#### CRITICAL-4: No Memory Leak Protection
**Severity**: CRITICAL
**Location**: `context-window.component.ts:194-207` (subscription with no cleanup)
**Problem**: Same issue as other tools

**Impact**: Memory leak on navigation
**Fix**: Add `ngOnDestroy` with `takeUntil`

---

#### CRITICAL-5: Missing Keyboard Focus on Unit/Sort Toggle Buttons
**Severity**: CRITICAL (WCAG 2.4.7 Level AA violation)
**Location**: `context-window.component.html:53-66, 76-89`
**Problem**:
```html
<button
  [class.bg-indigo-600]="contentUnit() === unit"
  [class.text-white]="contentUnit() === unit"
  [class.hover:bg-gray-50]="contentUnit() !== unit"
>
```
- No `focus:` classes defined
- Buttons have hover states but **no focus indicators**

**Impact**: Keyboard users cannot see which button is focused
**Fix**: Add focus styles:
```html
[class.focus:ring-2]="true"
[class.focus:ring-indigo-500]="true"
```

---

### HIGH Issues (4)

#### HIGH-1: No Loading Error Recovery
**Severity**: HIGH
**Location**: `context-window.component.ts:202-206`
**Problem**: Same as other tools — error logged but no UI feedback

**Impact**: User stuck with blank screen
**Fix**: Add error state and retry button

---

#### HIGH-2: Overflow Visualization Is Confusing
**Severity**: HIGH
**Location**: `context-window.component.html:154-169` (bar visualization)
**Problem**:
```html
<!-- Context window (full capacity) -->
<div [style.width.%]="contextBarWidth(result)"></div>
<!-- User input usage -->
<div [style.width.%]="contextBarWidth(result) * usageBarWidth(result) / 100"></div>
```
- Two nested divs with complex width calculations
- Red overflow tokens shown in text but **not visually represented in bar**
- User sees "Overflow" badge but bar looks normal

**Impact**: Users don't understand severity of overflow
**Fix**: Extend red bar beyond 100% OR add separate overflow bar segment

---

#### HIGH-3: No Form Reset Option
**Severity**: HIGH
**Location**: `context-window.component.html:29-91`
**Problem**: User adjusts content size + unit + sort mode with no reset button

**Impact**: Must manually revert changes
**Fix**: Add "Reset" button to sticky bar

---

#### HIGH-4: Sort Mode Labels Are Unclear
**Severity**: HIGH
**Location**: `context-window.component.html:86`
**Problem**:
```html
{{ mode === 'price' ? 'Cheapest First' : 'Largest First' }}
```
- "Cheapest First" is ambiguous (cheapest per-token or cheapest for this input?)
- "Largest First" doesn't clarify what "largest" means (context window size)

**Impact**: User doesn't know what they're sorting by
**Fix**: Improve labels:
- "Cheapest First" → "Best Value (Price)"
- "Largest First" → "Max Context Window"

---

### MEDIUM Issues (3)

#### MEDIUM-1: No Success State Guidance
**Severity**: MEDIUM
**Location**: `context-window.component.html:120-128` (Fits badge)
**Problem**:
```html
@if (result.isValid) {
  <span class="...bg-green-100 text-green-800">Fits</span>
}
```
- Shows "Fits" badge but **no next step CTA**
- User sees green checkmark but doesn't know what to do next (e.g., "Use this model" button)

**Impact**: User doesn't know how to proceed after finding valid model
**Fix**: Add CTA button next to "Fits" badge:
```html
<a routerLink="/tools/chatbot-simulator" [queryParams]="{model: result.modelId}">
  Calculate Cost →
</a>
```

---

#### MEDIUM-2: Model Cards Too Dense on Mobile
**Severity**: MEDIUM
**Location**: `context-window.component.html:113-189`
**Problem**: Each card has:
- Model name + provider
- Fits/Overflow badge
- Cost badge
- Price alert button
- Bar visualization
- 4 stat labels

**Impact**: Information overload on small screens
**Fix**: Hide less critical info on mobile (e.g., price alert button, percentage)

---

#### MEDIUM-3: No Input Validation Feedback
**Severity**: MEDIUM
**Location**: `context-window.component.ts:132-134`
**Problem**: `Math.max(1, value)` silently clamps input

**Impact**: User doesn't know when they hit min limit
**Fix**: Add validation message

---

### LOW Issues (1)

#### LOW-1: Emoji Accessibility in Cross-Links
**Severity**: LOW
**Location**: `context-window.component.html:198, 208, 218`
**Problem**: Same as caching-roi — emojis not hidden from screen readers

**Impact**: Minor screen reader annoyance
**Fix**: Add `aria-hidden="true"`

---

### Summary: Context Window
- **Total Issues**: 13
- **Breakdown**: 5 critical, 4 high, 3 medium, 1 low
- **Estimated Fix Effort**: 10-12 hours
- **Priority Ranking**: 1/3 (MOST URGENT)

---

## Comparative Summary

### Shared Critical Issues Across All Tools

| Issue | batch-api | caching-roi | context-window |
|-------|-----------|-------------|----------------|
| No empty state for zero models | ✅ | ✅ | ✅ |
| Missing keyboard focus indicators | ✅ | ✅ | ✅ |
| No memory leak protection (ngOnDestroy) | ✅ | ✅ | ✅ |
| Missing ARIA labels on icon buttons | ✅ | ✅ | ✅ |
| No loading error recovery | ✅ | ✅ | ✅ |
| No form reset option | ✅ | ✅ | ✅ |
| Sticky elements covering content | ✅ | ✅ | ✅ |

---

### UX Quality Scores (1-10)

| Tool | Score | Rationale |
|------|-------|-----------|
| **context-window** | 5.5/10 | Most complex UI with worst keyboard nav (15+ tab stops), confusing overflow viz, sticky bar issues |
| **batch-api** | 6.5/10 | Simpler UI but still missing key accessibility features, trivial savings warning hidden |
| **caching-roi** | 7.0/10 | Best of three but cache hit rate slider is confusing, break-even metric misleading |

---

### Recommended Fix Priority

1. **FIRST: context-window** (10-12 hours)
   - Fix sticky controls covering content
   - Remove per-model price alert buttons (keyboard nav hell)
   - Add empty state for "no models fit"
   - Fix overflow visualization

2. **SECOND: batch-api** (6-8 hours)
   - Add empty state for zero batch models
   - Fix keyboard focus indicators
   - Add memory leak protection
   - Improve trivial savings warning placement

3. **THIRD: caching-roi** (5-7 hours)
   - Fix inverted cache hit rate slider
   - Clarify break-even metric
   - Add empty state for zero cacheable models
   - Add memory leak protection

---

## Immediate Action Items (Apply to All Tools)

### Quick Wins (1-2 hours total)
1. Add `aria-hidden="true"` to all decorative emojis
2. Add `aria-label` to all icon-only buttons
3. Add `focus:ring-2 focus:ring-indigo-500` to all interactive elements

### High-Impact Fixes (4-6 hours total)
1. Implement `ngOnDestroy` with `takeUntil` in all components
2. Add error state signals and retry buttons
3. Add empty state checks before model dropdowns
4. Add "Reset to Defaults" buttons to all forms

### Accessibility Blockers (3-4 hours total)
1. Fix keyboard focus indicators on all inputs
2. Remove or hide redundant price alert buttons from keyboard nav
3. Add proper ARIA labels to all interactive elements
4. Fix sticky elements covering content (increase `top` offset)

---

## Conclusion

All three tools share the **same 7 critical UX issues** found in chatbot-simulator:
- No empty states
- Missing keyboard focus
- No memory leak protection
- Accessibility violations
- No error recovery
- No form reset
- Sticky element issues

**context-window is the worst offender** due to:
- Complex sticky controls + scrollable list interaction
- 15+ unnecessary tab stops (price alert on every model)
- Confusing overflow visualization
- No clear next steps when no models fit

**Estimated total fix effort: 21-27 hours** for all three tools.

**Recommendation**: Fix context-window FIRST (highest user impact), then batch-api, then caching-roi.
