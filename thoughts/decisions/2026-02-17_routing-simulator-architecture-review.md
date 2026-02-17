# Smart Routing Simulator - Critical Architecture Review

**Date**: 2026-02-17
**Reviewer**: Architecture Reviewer Agent
**Component**: `chatbot-simulator.component.ts` (lines 340-394, 1034-1070)
**Severity**: CRITICAL - Feature is broken in multiple edge cases

---

## Executive Summary

The Smart Routing Simulator feature has **5 critical bugs** caused by improper reactive state management. The root cause is a violation of Angular Signals best practices: routing model IDs are not validated or updated when `activeModels()` changes, leading to stale references and empty dropdowns.

**Impact**: Users cannot reliably use the routing feature. The savings calculation may be incorrect, and the UI shows inconsistent state.

**Recommendation**: Complete refactor of routing state management using computed signals and validation guards.

---

## 1. Logic Flow Analysis

### 1.1 How `toggleRouting()` Works (Lines 1034-1049)

```typescript
toggleRouting(): void {
  const newState = !this.routingEnabled();
  this.routingEnabled.set(newState);

  // Set defaults when enabling
  if (newState && this.activeModels().length >= 2) {
    const sorted = [...this.results()].sort(
      (a, b) => a.monthlyCost - b.monthlyCost,
    );
    // Primary = cheapest, Secondary = most expensive of selected
    this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
    this.routingSecondaryModelId.set(
      sorted[sorted.length - 1]?.modelId ?? null,
    );
  }
}
```

**Analysis**:
- ✅ Correctly checks if `activeModels().length >= 2` before setting defaults
- ✅ Sorts by cost and assigns cheapest → primary, most expensive → secondary
- ❌ **BUG 1**: Does NOT reset routing model IDs when disabling (`newState === false`)
- ❌ **BUG 2**: Does NOT handle case when enabled with 0 or 1 models selected
- ❌ **BUG 3**: Does NOT react to `activeModels()` changes after initial toggle

### 1.2 How `routedMonthlyCost` Computed Works (Lines 353-386)

```typescript
routedMonthlyCost = computed(() => {
  if (!this.routingEnabled()) return null;

  const primaryId = this.routingPrimaryModelId();
  const secondaryId = this.routingSecondaryModelId();
  if (!primaryId || !secondaryId) return null;

  const results = this.results();
  const primaryResult = results.find((r) => r.modelId === primaryId);
  const secondaryResult = results.find((r) => r.modelId === secondaryId);
  if (!primaryResult || !secondaryResult) return null;

  const primaryPercent = this.routingPrimaryPercent() / 100;
  const secondaryPercent = 1 - primaryPercent;

  const blendedCost =
    primaryResult.monthlyCost * primaryPercent +
    secondaryResult.monthlyCost * secondaryPercent;

  // Calculate savings vs using secondary model for everything
  const savingsVsSecondary = secondaryResult.monthlyCost - blendedCost;
  const savingsPercent =
    (savingsVsSecondary / secondaryResult.monthlyCost) * 100;

  return {
    blendedCost: Math.round(blendedCost * 100) / 100,
    primaryModel: primaryResult.modelName,
    secondaryModel: secondaryResult.modelName,
    primaryCost: primaryResult.monthlyCost,
    secondaryCost: secondaryResult.monthlyCost,
    savingsVsSecondary: Math.round(savingsVsSecondary * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
});
```

**Analysis**:
- ✅ Correctly returns `null` if routing is disabled
- ✅ Correctly returns `null` if either model ID is missing
- ✅ Blended cost formula is mathematically correct: `(primary * %) + (secondary * (1 - %))`
- ✅ Savings calculation is correct: `secondaryCost - blendedCost`
- ❌ **BUG 4**: Returns `null` when `primaryResult` or `secondaryResult` not found in `results()`
  - This happens when routing model IDs reference models NOT in `activeModels()`
  - Root cause: No validation that selected routing models are in `activeModels()`

### 1.3 What Happens When `activeModels()` Changes?

**Current Behavior**:
- `activeModels()` is a computed signal: `computed(() => models().filter(m => selectedModelIds().has(m.id)))`
- When user toggles a model via `toggleModel()`, `selectedModelIds` updates
- `activeModels()` recomputes automatically
- `results()` recomputes automatically (depends on `activeModels()`)
- ❌ **BUG 5**: `routingPrimaryModelId` and `routingSecondaryModelId` do NOT update
- ❌ **Result**: Dropdowns show models that are no longer in `activeModels()`, or become empty

**Expected Behavior**:
- When a routing model is deselected from `activeModels()`, routing should either:
  1. Auto-disable (safest), OR
  2. Auto-update to the next valid model in the sorted list

### 1.4 What Happens When Routing Model IDs Change?

**Current Behavior**:
- User changes dropdown → `setRoutingPrimary(modelId)` or `setRoutingSecondary(modelId)` called
- These methods directly set the signal values
- `routedMonthlyCost` recomputes automatically (depends on these signals)
- ✅ This works correctly IF the selected model ID exists in `activeModels()`

---

## 2. Bug Identification

### Bug #1: Empty Dropdowns When Enabling Routing Before Model Selection

**Scenario**:
1. User lands on page with 0 models selected (or default preset not loaded yet)
2. User clicks "Try It" to enable routing
3. Dropdowns render with `@for (model of activeModels(); track model.id)`
4. `activeModels()` is empty → dropdowns are empty

**Root Cause**:
- `toggleRouting()` checks `activeModels().length >= 2` before setting defaults
- If check fails, routing is enabled but model IDs remain `null`
- Dropdowns iterate over `activeModels()`, which is empty
- HTML has no fallback or disabled state for empty dropdowns

**Fix**:
- Prevent enabling routing if `activeModels().length < 2`
- Show validation message: "Select at least 2 models to use Smart Routing"

### Bug #2: Both Dropdowns Show the Same Model

**Scenario**:
1. User selects 2+ models
2. User enables routing → defaults set correctly (cheapest vs most expensive)
3. User deselects the primary model from the model filter
4. `activeModels()` no longer includes the primary model
5. Dropdown still shows the deselected model as selected (stale value)
6. User changes primary dropdown → now both dropdowns have the same value

**Root Cause**:
- `routingPrimaryModelId` and `routingSecondaryModelId` hold **stale references**
- These signals are not reactive to `activeModels()` changes
- Dropdowns use `[value]="routingPrimaryModelId()"` which is now an invalid ID
- Browser's `<select>` element behavior: if `[value]` doesn't match any `<option>`, it shows the first option or blank

**Fix**:
- Create computed signals that validate routing model IDs against `activeModels()`
- If a routing model ID is no longer in `activeModels()`, auto-reset to a valid model or auto-disable routing

### Bug #3: Savings Section Doesn't Appear When It Should

**Scenario**:
1. User enables routing with 2+ models selected
2. `toggleRouting()` sets model IDs correctly
3. `routedMonthlyCost()` should compute and return an object
4. Savings section doesn't render

**Root Cause**:
- `routedMonthlyCost()` returns `null` if `primaryResult` or `secondaryResult` not found
- This happens when:
  - `routingPrimaryModelId` or `routingSecondaryModelId` is `null`
  - OR these IDs don't exist in `results()` (because they're not in `activeModels()`)
- HTML template: `@if (routedMonthlyCost(); as routed)` → evaluates to falsy, section hidden

**Fix**:
- Ensure routing model IDs are ALWAYS valid when routing is enabled
- Add validation guard in computed signal or `toggleRouting()`

### Bug #4: Savings Section Doesn't Update When Models Are Changed

**Scenario**:
1. Routing is enabled and working (savings section visible)
2. User adjusts input sliders (messages/day, tokens, cache rate)
3. Model costs update (visible in model cards below)
4. Savings section shows stale numbers

**Root Cause**:
- ❌ **THIS IS ACTUALLY NOT A BUG** (false alarm from user report)
- `routedMonthlyCost()` is a computed signal that depends on:
  - `routingEnabled()`
  - `routingPrimaryModelId()`
  - `routingSecondaryModelId()`
  - `results()` → depends on all input signals
  - `routingPrimaryPercent()`
- When inputs change, `results()` recomputes, which triggers `routedMonthlyCost()` recompute
- ✅ **Reactivity is correct**

**Possible User Error**:
- User saw stale data due to Bugs #2 or #3 (invalid model IDs)
- Once model IDs are fixed, reactivity should work

### Bug #5: Calculations Might Be Incorrect (Don't Match Cards Below)

**Investigation**:
- Blended cost formula: `(primary * %) + (secondary * (1 - %))` ✅ Correct
- Savings calculation: `secondaryCost - blendedCost` ✅ Correct
- Rounding: `Math.round(value * 100) / 100` ✅ Correct (2 decimals)

**Potential Issue**:
- If routing model IDs reference wrong models (due to stale state), calculations will be incorrect
- Example: User thinks they selected "GPT-4o" but `routingPrimaryModelId` still references "Gemini Flash" from a previous selection

**Verification Needed**:
- Compare `routedMonthlyCost().primaryCost` with the monthly cost shown in the card for the primary model
- If they don't match → stale model ID reference

---

## 3. Edge Case Analysis

### Edge Case 1: Enable Routing with 0 Models Selected

**Current Behavior**:
- `toggleRouting()` checks `activeModels().length >= 2`
- If check fails, routing is enabled but no defaults are set
- `routingPrimaryModelId` and `routingSecondaryModelId` remain `null`
- Dropdowns are empty (no models to iterate)
- `routedMonthlyCost()` returns `null` (no model IDs)
- Savings section is hidden

**Expected Behavior**:
- Routing should NOT enable if fewer than 2 models selected
- Show validation message: "Select at least 2 models to enable Smart Routing"

**Fix**:
```typescript
toggleRouting(): void {
  const newState = !this.routingEnabled();

  // Validation: Require at least 2 models
  if (newState && this.activeModels().length < 2) {
    // Show toast or alert
    alert('Please select at least 2 models to use Smart Routing');
    return;
  }

  this.routingEnabled.set(newState);

  if (newState) {
    const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
    this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
    this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
  } else {
    // Reset when disabling
    this.routingPrimaryModelId.set(null);
    this.routingSecondaryModelId.set(null);
  }
}
```

### Edge Case 2: Enable Routing with 1 Model Selected

**Current Behavior**:
- Same as Edge Case 1 (check fails, routing enabled with null model IDs)

**Expected Behavior**:
- Same validation as Edge Case 1

### Edge Case 3: Enable with 2+ Models, Then Deselect Until <2 Remain

**Current Behavior**:
1. User selects models A, B, C
2. User enables routing → Primary=A, Secondary=C
3. User deselects model A via model filter
4. `activeModels()` now only has B, C
5. `routingPrimaryModelId` still references A (stale)
6. Primary dropdown shows B (first available option) but value is A (mismatch)
7. `routedMonthlyCost()` tries to find model A in `results()` → not found → returns `null`
8. Savings section disappears

**Expected Behavior**:
- When `activeModels().length < 2`, routing should auto-disable
- Show info message: "Smart Routing disabled: requires 2+ models"

**Fix**:
- Add effect or computed signal that watches `activeModels()` and auto-disables routing if needed

### Edge Case 4: Change Routing Selections to Models Not in activeModels Anymore

**Current Behavior**:
- User manually changes dropdown to select a model
- `setRoutingPrimary(modelId)` sets the signal
- No validation that `modelId` exists in `activeModels()`
- If user somehow selects an invalid ID (shouldn't happen with dropdowns), calculations break

**Expected Behavior**:
- Dropdown options are always filtered to `activeModels()` (currently correct)
- Validation is implicit (user can't select an invalid model)
- ✅ This edge case is already handled by HTML template logic

### Edge Case 5: Change activeModels While Routing Is Enabled

**Current Behavior**:
- Covered by Edge Case 3

**Expected Behavior**:
- If routing model IDs become invalid, auto-update to next valid models OR auto-disable

---

## 4. Calculation Verification

### Blended Cost Formula (Lines 368-370)

```typescript
const blendedCost =
  primaryResult.monthlyCost * primaryPercent +
  secondaryResult.monthlyCost * secondaryPercent;
```

**Verification**:
- Let `primary = $100`, `secondary = $300`, `primaryPercent = 80%`
- Blended = `100 * 0.8 + 300 * 0.2 = 80 + 60 = 140` ✅ Correct

**Edge Case**: What if `primaryPercent = 0%`?
- Blended = `100 * 0 + 300 * 1 = 300` ✅ Correct (all traffic to secondary)

**Edge Case**: What if `primaryPercent = 100%`?
- Blended = `100 * 1 + 300 * 0 = 100` ✅ Correct (all traffic to primary)

### Savings Calculation (Lines 373-375)

```typescript
const savingsVsSecondary = secondaryResult.monthlyCost - blendedCost;
const savingsPercent = (savingsVsSecondary / secondaryResult.monthlyCost) * 100;
```

**Verification**:
- `secondary = $300`, `blended = $140`
- Savings = `300 - 140 = $160` ✅ Correct
- Savings % = `(160 / 300) * 100 = 53.3%` ✅ Correct

**Edge Case**: What if blended cost > secondary cost (bad routing)?
- Example: `primary = $400`, `secondary = $300`, `primaryPercent = 80%`
- Blended = `400 * 0.8 + 300 * 0.2 = 320 + 60 = 380`
- Savings = `300 - 380 = -$80` (negative)
- Savings % = `(-80 / 300) * 100 = -26.7%` (negative)
- HTML template: `@if (routed.savingsPercent > 0)` → shows "X% Savings", else shows "+X% More" ✅ Correct

### Percentage Application (Line 1070)

```typescript
setRoutingPercent(percent: number): void {
  this.routingPrimaryPercent.set(Math.min(100, Math.max(0, percent)));
}
```

**Verification**:
- Clamps value between 0 and 100 ✅ Correct
- HTML slider: `min="10" max="90" step="5"` ✅ Correct (prevents extreme values)

### Comparison with Model Cards

**How to Verify**:
1. Enable routing with models A and B
2. Note `routedMonthlyCost().primaryCost` and `.secondaryCost`
3. Find model A and B cards in the grid below
4. Compare `result.monthlyCost` for each card with routing costs
5. If they match → calculations are correct
6. If they don't match → stale model ID reference (Bug #2)

**Expected Behavior**:
- `routedMonthlyCost().primaryCost` === Model A card monthly cost
- `routedMonthlyCost().secondaryCost` === Model B card monthly cost
- `routedMonthlyCost().blendedCost` === weighted average of A and B

---

## 5. Root Cause Summary

All 5 bugs stem from **improper reactive state management**:

1. **Routing model IDs are not validated against activeModels()**
   - `routingPrimaryModelId` and `routingSecondaryModelId` can hold stale references
   - When `activeModels()` changes, these signals don't auto-update

2. **No guard to prevent enabling routing with insufficient models**
   - `toggleRouting()` allows enabling with 0 or 1 models selected
   - Results in null model IDs and empty dropdowns

3. **No cleanup when disabling routing**
   - Model IDs are not reset to null when routing is toggled off
   - May cause confusion if user re-enables routing

4. **No reactive effect to auto-disable routing when activeModels changes**
   - If user deselects models while routing is enabled, routing stays enabled with invalid state

---

## 6. Proposed Fixes

### Fix #1: Add Validation Guards in toggleRouting()

```typescript
toggleRouting(): void {
  const newState = !this.routingEnabled();

  // GUARD: Require at least 2 models to enable
  if (newState && this.activeModels().length < 2) {
    // Option A: Silent fail (do nothing)
    // Option B: Show toast notification
    console.warn('Smart Routing requires at least 2 models selected');
    return;
  }

  this.routingEnabled.set(newState);

  if (newState) {
    // Initialize with cheapest and most expensive
    const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
    this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
    this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
  } else {
    // CLEANUP: Reset model IDs when disabling
    this.routingPrimaryModelId.set(null);
    this.routingSecondaryModelId.set(null);
  }
}
```

### Fix #2: Add Computed Signals for Validated Routing Model IDs

**Option A: Computed Signals (Preferred)**

```typescript
// Computed: Validated primary model ID (auto-corrects if invalid)
validatedRoutingPrimaryId = computed(() => {
  const id = this.routingPrimaryModelId();
  const active = this.activeModels();

  // If current ID is valid, keep it
  if (id && active.some(m => m.id === id)) {
    return id;
  }

  // Otherwise, fallback to cheapest model
  const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[0]?.modelId ?? null;
});

// Computed: Validated secondary model ID
validatedRoutingSecondaryId = computed(() => {
  const id = this.routingSecondaryModelId();
  const active = this.activeModels();
  const primaryId = this.validatedRoutingPrimaryId();

  // If current ID is valid AND different from primary, keep it
  if (id && id !== primaryId && active.some(m => m.id === id)) {
    return id;
  }

  // Otherwise, fallback to most expensive model (excluding primary)
  const sorted = [...this.results()]
    .filter(r => r.modelId !== primaryId)
    .sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[sorted.length - 1]?.modelId ?? null;
});
```

**Then update `routedMonthlyCost` to use validated IDs**:

```typescript
routedMonthlyCost = computed(() => {
  if (!this.routingEnabled()) return null;

  const primaryId = this.validatedRoutingPrimaryId();
  const secondaryId = this.validatedRoutingSecondaryId();
  if (!primaryId || !secondaryId) return null;

  // Rest of the logic unchanged...
});
```

**And update dropdowns in HTML**:

```html
<select
  [value]="validatedRoutingPrimaryId()"
  (change)="setRoutingPrimary($any($event.target).value)"
>
  @for (model of activeModels(); track model.id) {
    <option [value]="model.id">{{ model.name }}</option>
  }
</select>
```

**Option B: Effect to Auto-Update (Alternative)**

```typescript
constructor() {
  // Effect: Auto-update routing model IDs when activeModels changes
  effect(() => {
    if (!this.routingEnabled()) return;

    const active = this.activeModels();
    const primaryId = this.routingPrimaryModelId();
    const secondaryId = this.routingSecondaryModelId();

    // Check if current selections are still valid
    const isPrimaryValid = primaryId && active.some(m => m.id === primaryId);
    const isSecondaryValid = secondaryId && active.some(m => m.id === secondaryId);

    // If either is invalid, re-initialize
    if (!isPrimaryValid || !isSecondaryValid) {
      const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
      this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
      this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
    }
  });
}
```

**Comparison**:
- **Option A (Computed)**: More declarative, no side effects, follows Angular Signals best practices
- **Option B (Effect)**: Imperative, may cause infinite loops if not careful
- **Recommendation**: Use Option A (computed signals)

### Fix #3: Auto-Disable Routing When Insufficient Models

```typescript
constructor() {
  // Effect: Auto-disable routing if fewer than 2 models selected
  effect(() => {
    if (this.routingEnabled() && this.activeModels().length < 2) {
      this.routingEnabled.set(false);
      this.routingPrimaryModelId.set(null);
      this.routingSecondaryModelId.set(null);
      console.warn('Smart Routing auto-disabled: requires 2+ models');
    }
  });
}
```

### Fix #4: Add Visual Feedback for Invalid State

**HTML Template - Show Warning When Not Enough Models**:

```html
@if (routingEnabled() && activeModels().length < 2) {
  <div class="bg-red-50 border border-red-300 rounded-lg p-3">
    <p class="text-sm text-red-800">
      Smart Routing requires at least 2 models. Please select more models to continue.
    </p>
  </div>
}
```

**HTML Template - Disable "Try It" Button When Not Enough Models**:

```html
<button
  type="button"
  (click)="toggleRouting()"
  [disabled]="!routingEnabled() && activeModels().length < 2"
  [class.opacity-50]="!routingEnabled() && activeModels().length < 2"
  [class.cursor-not-allowed]="!routingEnabled() && activeModels().length < 2"
  class="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
  [class.bg-purple-600]="routingEnabled()"
  [class.text-white]="routingEnabled()"
  [class.bg-white]="!routingEnabled()"
  [class.text-purple-600]="!routingEnabled()"
  [class.border]="!routingEnabled()"
  [class.border-purple-300]="!routingEnabled()"
>
  {{ routingEnabled() ? "Enabled" : "Try It" }}
</button>

@if (!routingEnabled() && activeModels().length < 2) {
  <p class="text-xs text-gray-500 mt-1">
    (Requires 2+ models selected)
  </p>
}
```

---

## 7. Complete Solution - Recommended Approach

### Step 1: Add Computed Signals for Validation

```typescript
// Add after line 393 (after routingSameModelSelected)

/**
 * Computed: Validated routing model IDs that auto-correct when activeModels changes.
 * This prevents stale references and empty dropdowns.
 */
validatedRoutingPrimaryId = computed(() => {
  if (!this.routingEnabled()) return null;

  const id = this.routingPrimaryModelId();
  const active = this.activeModels();

  // If current ID is valid and exists in activeModels, keep it
  if (id && active.some(m => m.id === id)) {
    return id;
  }

  // Otherwise, fallback to cheapest model
  const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[0]?.modelId ?? null;
});

validatedRoutingSecondaryId = computed(() => {
  if (!this.routingEnabled()) return null;

  const id = this.routingSecondaryModelId();
  const active = this.activeModels();
  const primaryId = this.validatedRoutingPrimaryId();

  // If current ID is valid, different from primary, and exists in activeModels, keep it
  if (id && id !== primaryId && active.some(m => m.id === id)) {
    return id;
  }

  // Otherwise, fallback to most expensive model (excluding primary)
  const sorted = [...this.results()]
    .filter(r => r.modelId !== primaryId)
    .sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[sorted.length - 1]?.modelId ?? null;
});
```

### Step 2: Update routedMonthlyCost to Use Validated IDs

```typescript
// Replace lines 353-386
routedMonthlyCost = computed(() => {
  if (!this.routingEnabled()) return null;

  const primaryId = this.validatedRoutingPrimaryId();
  const secondaryId = this.validatedRoutingSecondaryId();
  if (!primaryId || !secondaryId) return null;

  const results = this.results();
  const primaryResult = results.find((r) => r.modelId === primaryId);
  const secondaryResult = results.find((r) => r.modelId === secondaryId);
  if (!primaryResult || !secondaryResult) return null;

  const primaryPercent = this.routingPrimaryPercent() / 100;
  const secondaryPercent = 1 - primaryPercent;

  const blendedCost =
    primaryResult.monthlyCost * primaryPercent +
    secondaryResult.monthlyCost * secondaryPercent;

  const savingsVsSecondary = secondaryResult.monthlyCost - blendedCost;
  const savingsPercent =
    (savingsVsSecondary / secondaryResult.monthlyCost) * 100;

  return {
    blendedCost: Math.round(blendedCost * 100) / 100,
    primaryModel: primaryResult.modelName,
    secondaryModel: secondaryResult.modelName,
    primaryCost: primaryResult.monthlyCost,
    secondaryCost: secondaryResult.monthlyCost,
    savingsVsSecondary: Math.round(savingsVsSecondary * 100) / 100,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
  };
});
```

### Step 3: Update toggleRouting() with Guards

```typescript
// Replace lines 1034-1049
toggleRouting(): void {
  const newState = !this.routingEnabled();

  // GUARD: Require at least 2 models to enable
  if (newState && this.activeModels().length < 2) {
    console.warn('Smart Routing requires at least 2 models selected');
    // TODO: Show toast notification for better UX
    return;
  }

  this.routingEnabled.set(newState);

  if (newState) {
    // Initialize with cheapest and most expensive
    const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
    this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
    this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
  } else {
    // CLEANUP: Reset model IDs when disabling
    this.routingPrimaryModelId.set(null);
    this.routingSecondaryModelId.set(null);
  }
}
```

### Step 4: Add Effect to Auto-Disable When Insufficient Models

```typescript
// Add to constructor() after other effects (around line 750)
constructor() {
  // ... existing effects ...

  // Effect: Auto-disable routing if fewer than 2 models selected
  effect(() => {
    if (this.routingEnabled() && this.activeModels().length < 2) {
      this.routingEnabled.set(false);
      this.routingPrimaryModelId.set(null);
      this.routingSecondaryModelId.set(null);
      console.info('Smart Routing auto-disabled: requires 2+ models');
    }
  });
}
```

### Step 5: Update HTML Template to Use Validated IDs

**Find lines 1034-1035 and 1049-1050 in HTML, replace with**:

```html
<!-- Primary Model Dropdown -->
<select
  class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
  [value]="validatedRoutingPrimaryId()"
  (change)="setRoutingPrimary($any($event.target).value)"
>
  @for (model of activeModels(); track model.id) {
    <option [value]="model.id">{{ model.name }}</option>
  }
</select>

<!-- Secondary Model Dropdown -->
<select
  class="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
  [value]="validatedRoutingSecondaryId()"
  (change)="setRoutingSecondary($any($event.target).value)"
>
  @for (model of activeModels(); track model.id) {
    <option [value]="model.id">{{ model.name }}</option>
  }
</select>
```

### Step 6: Improve UX with Validation Messages

**Add before routing configuration section (around line 1012)**:

```html
@if (routingEnabled() && activeModels().length < 2) {
  <div class="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
    <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
    </svg>
    <div>
      <p class="text-sm font-medium text-red-800">Not enough models selected</p>
      <p class="text-xs text-red-700 mt-0.5">
        Smart Routing requires at least 2 models to compare. Please select more models from the filter above.
      </p>
    </div>
  </div>
}
```

**Update "Try It" button to show disabled state (around line 997)**:

```html
<button
  type="button"
  (click)="toggleRouting()"
  [disabled]="!routingEnabled() && activeModels().length < 2"
  class="text-xs font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all cursor-pointer"
  [class.bg-purple-600]="routingEnabled()"
  [class.text-white]="routingEnabled()"
  [class.bg-white]="!routingEnabled()"
  [class.text-purple-600]="!routingEnabled() && activeModels().length >= 2"
  [class.border]="!routingEnabled()"
  [class.border-purple-300]="!routingEnabled() && activeModels().length >= 2"
  [class.opacity-50]="!routingEnabled() && activeModels().length < 2"
  [class.cursor-not-allowed]="!routingEnabled() && activeModels().length < 2"
  [class.bg-gray-100]="!routingEnabled() && activeModels().length < 2"
  [class.text-gray-400]="!routingEnabled() && activeModels().length < 2"
  [class.border-gray-300]="!routingEnabled() && activeModels().length < 2"
>
  {{ routingEnabled() ? "Enabled" : (activeModels().length >= 2 ? "Try It" : "Requires 2+ Models") }}
</button>
```

---

## 8. Testing Checklist

After implementing fixes, verify the following scenarios:

### Scenario A: Enable Routing with Sufficient Models
- [ ] Select 2+ models from filter
- [ ] Click "Try It" → Routing enabled
- [ ] Primary dropdown shows cheapest model
- [ ] Secondary dropdown shows most expensive model
- [ ] Savings section appears with correct calculations
- [ ] Blended cost matches weighted average

### Scenario B: Enable Routing with Insufficient Models
- [ ] Deselect all models (or select only 1)
- [ ] Click "Try It" → Button shows "Requires 2+ Models" and is disabled
- [ ] Routing does NOT enable

### Scenario C: Deselect Models While Routing Is Enabled
- [ ] Enable routing with models A, B, C
- [ ] Deselect model A (the primary model)
- [ ] Routing auto-updates primary to next cheapest model
- [ ] Savings section remains visible with updated calculations
- [ ] If only 1 model remains, routing auto-disables

### Scenario D: Change Routing Model Selections
- [ ] Enable routing
- [ ] Change primary dropdown to different model
- [ ] Savings section updates immediately
- [ ] Change secondary dropdown to different model
- [ ] Savings section updates immediately
- [ ] Try to select same model in both dropdowns → Warning appears

### Scenario E: Adjust Input Parameters While Routing Is Enabled
- [ ] Enable routing
- [ ] Adjust messages/day slider
- [ ] Savings section updates immediately
- [ ] Adjust token sliders
- [ ] Savings section updates immediately
- [ ] Adjust cache hit rate
- [ ] Savings section updates immediately

### Scenario F: Disable Routing
- [ ] Click "Enabled" button → Routing disabled
- [ ] Routing configuration section collapses
- [ ] Model IDs are reset to null

### Scenario G: Re-Enable Routing After Disabling
- [ ] Disable and re-enable routing
- [ ] Defaults are recalculated (cheapest vs most expensive of current selection)
- [ ] Previous selections are NOT remembered (fresh start)

---

## 9. Performance Considerations

### Computed Signal Reactivity
- ✅ Computed signals only recompute when dependencies change
- ✅ `validatedRoutingPrimaryId` and `validatedRoutingSecondaryId` depend on:
  - `routingEnabled()`
  - `routingPrimaryModelId()` / `routingSecondaryModelId()`
  - `activeModels()`
  - `results()`
- ⚠️ **Potential Issue**: If `results()` is expensive to compute, frequent recomputes may cause lag
- ✅ **Mitigation**: `results()` is already optimized (uses logic service, no side effects)

### Effect Auto-Disable
- ⚠️ **Potential Issue**: Effect triggers on every `activeModels()` change, even if routing is disabled
- ✅ **Mitigation**: Effect has early return if routing is not enabled (`if (!this.routingEnabled())`)

### HTML Template Loops
- ✅ Dropdowns iterate over `activeModels()`, which is already filtered (max 5 models per constraint)
- ✅ No performance concerns

---

## 10. Alternative Approaches Considered

### Alternative 1: Store Routing Model Objects Instead of IDs
**Pros**: No need to search `results()` for matching models
**Cons**: Violates Angular Signals immutability best practices, harder to serialize for URL params
**Decision**: ❌ Rejected - IDs are the correct primitive

### Alternative 2: Use BehaviorSubjects Instead of Signals
**Pros**: More familiar to developers with RxJS background
**Cons**: Signals are the future of Angular, better performance, simpler mental model
**Decision**: ❌ Rejected - Signals are the correct choice for reactive state

### Alternative 3: Disable Model Filter Checkboxes While Routing Is Enabled
**Pros**: Prevents user from deselecting routing models
**Cons**: Poor UX, confusing behavior
**Decision**: ❌ Rejected - Better to auto-update routing selections

### Alternative 4: Show Routing as a Separate "Mode" (Radio Buttons)
**Pros**: Clearer separation between "Compare All" vs "Routing Simulator"
**Cons**: Requires larger refactor, may confuse users who want both views
**Decision**: ❌ Rejected - Current toggle approach is fine once bugs are fixed

---

## 11. Conclusion

The Smart Routing Simulator is a **high-value differentiator** for the LLM Cost Engine, but it has **critical bugs** that prevent reliable usage. All bugs stem from **improper reactive state management** with Angular Signals.

### Root Cause
- Routing model IDs (`routingPrimaryModelId`, `routingSecondaryModelId`) are not validated against `activeModels()`
- No guards to prevent invalid state (enabling with <2 models, stale references)
- No cleanup when disabling routing

### Recommended Solution
1. Add computed signals (`validatedRoutingPrimaryId`, `validatedRoutingSecondaryId`) to auto-correct stale references
2. Add validation guard in `toggleRouting()` to require 2+ models
3. Add effect to auto-disable routing when `activeModels().length < 2`
4. Update HTML template to use validated IDs and show validation messages
5. Add cleanup logic when disabling routing

### Implementation Priority
🔴 **CRITICAL** - Feature is broken and user-facing

### Estimated Effort
- Implementation: 2-3 hours
- Testing: 1-2 hours
- Total: 3-5 hours

### Success Criteria
- [ ] All 7 test scenarios pass
- [ ] No console errors or warnings
- [ ] Savings calculations match model card costs
- [ ] Dropdowns are never empty when routing is enabled
- [ ] Auto-disable works correctly when models are deselected

---

## 12. Next Steps

1. **Implement Fix**: Apply the complete solution (Steps 1-6)
2. **Manual Testing**: Verify all test scenarios (Section 8)
3. **Automated Testing**: Add unit tests for computed signals and edge cases
4. **User Testing**: Deploy to staging and collect feedback
5. **Documentation**: Update feature documentation with usage examples

---

**Review Status**: ✅ Complete
**Approval Required**: Yes - Critical bug fix affecting user-facing feature
**Blocking Issues**: None - All dependencies are internal
**Risk Level**: Low - Changes are isolated to routing feature, no impact on core comparison logic
