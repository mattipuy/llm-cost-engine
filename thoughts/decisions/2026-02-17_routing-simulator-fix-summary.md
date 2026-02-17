# Smart Routing Simulator - Bug Fix Summary

**Date**: 2026-02-17
**Severity**: CRITICAL
**Files**: `chatbot-simulator.component.ts`, `chatbot-simulator.component.html`
**Estimated Fix Time**: 3-5 hours

---

## The Problem (TL;DR)

Routing model IDs (`routingPrimaryModelId`, `routingSecondaryModelId`) become **stale** when `activeModels()` changes. This causes:

1. Empty dropdowns when enabling routing before selecting models
2. Both dropdowns showing the same model (stale references)
3. Savings section not appearing (null results)
4. Calculations being incorrect (referencing wrong models)

---

## Root Cause

**Violation of Angular Signals reactive principles**:
- Routing model IDs are writable signals that don't react to `activeModels()` changes
- No validation that selected routing models exist in `activeModels()`
- No guards to prevent enabling routing with <2 models

---

## The Fix (3 Key Changes)

### 1. Add Computed Signals for Validation

```typescript
validatedRoutingPrimaryId = computed(() => {
  if (!this.routingEnabled()) return null;
  const id = this.routingPrimaryModelId();
  const active = this.activeModels();

  // If current ID is valid, keep it; otherwise fallback to cheapest
  if (id && active.some(m => m.id === id)) return id;
  const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[0]?.modelId ?? null;
});

validatedRoutingSecondaryId = computed(() => {
  if (!this.routingEnabled()) return null;
  const id = this.routingSecondaryModelId();
  const active = this.activeModels();
  const primaryId = this.validatedRoutingPrimaryId();

  // If current ID is valid and different from primary, keep it; otherwise fallback to most expensive
  if (id && id !== primaryId && active.some(m => m.id === id)) return id;
  const sorted = [...this.results()]
    .filter(r => r.modelId !== primaryId)
    .sort((a, b) => a.monthlyCost - b.monthlyCost);
  return sorted[sorted.length - 1]?.modelId ?? null;
});
```

### 2. Update `toggleRouting()` with Guards

```typescript
toggleRouting(): void {
  const newState = !this.routingEnabled();

  // GUARD: Require 2+ models
  if (newState && this.activeModels().length < 2) {
    console.warn('Smart Routing requires at least 2 models selected');
    return;
  }

  this.routingEnabled.set(newState);

  if (newState) {
    const sorted = [...this.results()].sort((a, b) => a.monthlyCost - b.monthlyCost);
    this.routingPrimaryModelId.set(sorted[0]?.modelId ?? null);
    this.routingSecondaryModelId.set(sorted[sorted.length - 1]?.modelId ?? null);
  } else {
    // CLEANUP: Reset when disabling
    this.routingPrimaryModelId.set(null);
    this.routingSecondaryModelId.set(null);
  }
}
```

### 3. Add Effect to Auto-Disable When Insufficient Models

```typescript
constructor() {
  // ... existing effects ...

  // Effect: Auto-disable routing if <2 models selected
  effect(() => {
    if (this.routingEnabled() && this.activeModels().length < 2) {
      this.routingEnabled.set(false);
      this.routingPrimaryModelId.set(null);
      this.routingSecondaryModelId.set(null);
    }
  });
}
```

---

## HTML Changes

1. Replace `routingPrimaryModelId()` with `validatedRoutingPrimaryId()` in dropdown `[value]`
2. Replace `routingSecondaryModelId()` with `validatedRoutingSecondaryId()` in dropdown `[value]`
3. Add validation message when `activeModels().length < 2`
4. Disable "Try It" button when insufficient models

---

## Testing Checklist

- [ ] Enable routing with 0 models → Button disabled
- [ ] Enable routing with 1 model → Button disabled
- [ ] Enable routing with 2+ models → Works correctly
- [ ] Deselect primary model while routing enabled → Auto-updates to next cheapest
- [ ] Deselect until <2 models remain → Routing auto-disables
- [ ] Change routing selections → Savings section updates immediately
- [ ] Adjust input parameters → Savings section updates immediately
- [ ] Calculations match model card costs

---

## Why This Works

**Before**: Routing model IDs were "write-once" signals that never updated when `activeModels()` changed.

**After**: Validated IDs are **computed signals** that automatically react to `activeModels()` changes and always return valid model IDs or null.

**Result**: Dropdowns are never empty, calculations are always correct, and the feature gracefully handles all edge cases.

---

## Risk Assessment

**Low Risk**:
- Changes are isolated to routing feature
- No impact on core comparison logic
- Computed signals are pure (no side effects)
- Effect has early return to prevent unnecessary work

**High Impact**:
- Fixes all 5 reported bugs
- Improves UX with validation messages
- Prevents future bugs from stale references

---

## Files to Modify

1. `/Users/mattia/Projects/mattia/llm-cost-engine/src/app/engines/chatbot-simulator/chatbot-simulator.component.ts`
   - Add computed signals (after line 393)
   - Update `routedMonthlyCost` (lines 353-386)
   - Update `toggleRouting()` (lines 1034-1049)
   - Add effect to constructor (around line 750)

2. `/Users/mattia/Projects/mattia/llm-cost-engine/src/app/engines/chatbot-simulator/chatbot-simulator.component.html`
   - Update primary dropdown `[value]` (line 1034)
   - Update secondary dropdown `[value]` (line 1049)
   - Add validation message (before line 1012)
   - Update "Try It" button (line 997)

---

## Ready to Implement?

See full architectural analysis in:
`/Users/mattia/Projects/mattia/llm-cost-engine/thoughts/decisions/2026-02-17_routing-simulator-architecture-review.md`

**Approval Required**: YES (Critical bug fix)
**Deploy After**: Manual testing + Lighthouse audit
