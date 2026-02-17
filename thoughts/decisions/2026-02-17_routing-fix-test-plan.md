# Smart Routing Simulator - Test Plan

**Date**: 2026-02-17
**Implementation Status**: COMPLETE
**Ready for Testing**: YES

---

## Pre-Test Setup

1. Start local dev server: `npm start`
2. Navigate to `/tools/chatbot-simulator`
3. Have browser dev console open to watch for errors

---

## Test Scenarios

### ✅ Scenario 1: Enable routing with 0 models selected
**Expected**: "Try It" button is disabled and grayed out. Yellow warning appears: "Select at least 2 models"
**Steps**:
1. Load page (no models selected by default)
2. Scroll to "Smart Routing Simulator" section
3. Observe button state

**Pass Criteria**:
- Button is disabled (cursor-not-allowed, opacity-50)
- Yellow warning box is visible
- Clicking button does nothing

---

### ✅ Scenario 2: Enable routing with 1 model selected
**Expected**: Same as Scenario 1
**Steps**:
1. Select 1 model (e.g., Claude Sonnet 4.5)
2. Scroll to routing section
3. Try to click "Try It"

**Pass Criteria**:
- Button still disabled
- Warning still visible
- Console shows no errors

---

### ✅ Scenario 3: Enable routing with 2+ models
**Expected**: Button enabled, routing activates, dropdowns populated, savings appear
**Steps**:
1. Select 2+ models (e.g., DeepSeek V3, Claude Sonnet 4.5, GPT-5.1)
2. Click "Try It" button
3. Observe routing interface

**Pass Criteria**:
- Button changes to "Enabled" (purple background)
- Primary dropdown shows cheapest model (DeepSeek V3)
- Secondary dropdown shows most expensive model (GPT-5.1)
- Blended cost section appears with correct numbers
- Savings percentage shown

---

### ✅ Scenario 4: Deselect primary model while routing enabled
**Expected**: Primary dropdown auto-updates to next cheapest model
**Steps**:
1. Enable routing with 3 models (DeepSeek V3, Claude Sonnet 4.5, GPT-5.1)
2. Primary = DeepSeek V3, Secondary = GPT-5.1
3. Deselect DeepSeek V3 from model comparison
4. Watch primary dropdown

**Pass Criteria**:
- Primary dropdown automatically switches to Claude Sonnet 4.5 (next cheapest)
- No error in console
- Savings section updates immediately
- Numbers recalculate correctly

---

### ✅ Scenario 5: Deselect until <2 models remain
**Expected**: Routing auto-disables gracefully
**Steps**:
1. Enable routing with 2 models
2. Deselect one model
3. Observe routing section

**Pass Criteria**:
- Routing automatically switches to "disabled" state
- Button returns to "Try It" (white background)
- Warning message reappears
- No error in console
- No flash or visual glitch

---

### ✅ Scenario 6: Change routing model selections manually
**Expected**: Savings section updates immediately
**Steps**:
1. Enable routing with 3 models
2. Change primary dropdown from DeepSeek V3 to Claude Sonnet 4.5
3. Change secondary dropdown from GPT-5.1 to DeepSeek V3
4. Watch savings numbers

**Pass Criteria**:
- Blended cost updates immediately (no delay)
- Savings percentage recalculates
- Model names in savings section update
- No stale data shown

---

### ✅ Scenario 7: Adjust input parameters while routing enabled
**Expected**: Savings section updates in real-time
**Steps**:
1. Enable routing
2. Change "Messages per Day" slider
3. Change "Input Tokens" slider
4. Change "Cache Hit Rate" slider
5. Watch blended cost numbers

**Pass Criteria**:
- Blended cost updates as sliders move
- Savings percentage adjusts dynamically
- No lag or freeze
- Numbers stay consistent with model cards below

---

### ✅ Scenario 8: Verify calculation accuracy
**Expected**: Blended cost matches manual calculation
**Steps**:
1. Enable routing with 2 models
2. Note primary model cost (e.g., $50/mo)
3. Note secondary model cost (e.g., $200/mo)
4. Set split to 80% / 20%
5. Calculate manually: (50 * 0.8) + (200 * 0.2) = 40 + 40 = $80
6. Compare with displayed blended cost

**Pass Criteria**:
- Blended cost matches manual calculation
- Savings = Secondary cost - Blended cost (e.g., 200 - 80 = $120)
- Savings % = (120 / 200) * 100 = 60%
- All numbers are consistent

---

## Edge Cases to Test

### Edge Case 1: Same model in both dropdowns
**Expected**: Yellow warning appears, but doesn't break
**Steps**:
1. Enable routing
2. Manually change primary dropdown to same model as secondary
3. Observe warning

**Pass Criteria**:
- Yellow warning: "Same model selected"
- Blended cost still calculates (even if nonsensical)
- No console error

---

### Edge Case 2: Enable routing, then apply preset
**Expected**: Routing stays enabled, models update if preset changes selection
**Steps**:
1. Enable routing with custom models
2. Click a preset (e.g., "Customer Support")
3. Observe behavior

**Pass Criteria**:
- If preset has <2 models, routing auto-disables
- If preset has 2+, routing stays enabled and dropdowns update
- No stale references

---

### Edge Case 3: Rapid model selection changes
**Expected**: No race conditions or stale state
**Steps**:
1. Enable routing
2. Rapidly select/deselect models in quick succession
3. Watch for errors

**Pass Criteria**:
- No console errors
- Routing state stays consistent
- Dropdowns show valid models only
- Savings section appears/disappears correctly

---

## Visual Regression Checks

- [ ] No layout shift when enabling/disabling routing
- [ ] Dropdowns are styled consistently
- [ ] Warning boxes have proper spacing
- [ ] Button disabled state is clearly visible
- [ ] Numbers are tabular-nums (aligned vertically)
- [ ] Savings percentage has 1 decimal place

---

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance Checks

- [ ] No lag when adjusting sliders with routing enabled
- [ ] Dropdown opens instantly
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Console is clean (no warnings/errors)

---

## Sign-Off

**Developer**: _______________  Date: _______________
**QA Tester**: _______________  Date: _______________
**Product Owner**: _______________  Date: _______________

---

## Known Limitations

1. Routing requires 2+ models (by design)
2. Same model selection shows warning but doesn't prevent (by design)
3. Routing auto-disables when models drop below 2 (by design)

---

## Rollback Plan

If critical issues found:
1. `git revert HEAD`
2. Deploy previous version
3. File bug report with reproduction steps
