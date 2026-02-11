# LLM Pricing Registry Update - v[VERSION] ([DATE])

## Executive Summary
- **Version**: [OLD_VERSION] → [NEW_VERSION]
- **Models**: [OLD_COUNT] → [NEW_COUNT] (net +/- [DELTA])
- **Added**: [N] new models
- **Removed**: [N] legacy models
- **Corrected**: [N] pricing errors

---

## ✅ Changes Made

### 1. **Pricing Corrections** (if any)

| Model | Old Price | New Price | Source | Reason |
|-------|-----------|-----------|--------|--------|
| model-id | $X/$Y | $A/$B | [Link] | Provider updated pricing |

### 2. **Models Added** ([N] new)

#### Provider 1 ([N] new)
- **model-id-1**: $X/$Y - [Brief description]
  - Context: [N]K tokens
  - Rationale: [Why added]

#### Provider 2 ([N] new)
- **model-id-2**: $X/$Y - [Brief description]

### 3. **Models Removed** ([N] legacy)

| Removed | Reason | Replaced By | User Impact |
|---------|--------|-------------|-------------|
| old-model-id | [Reason - superseded/deprecated/etc] | new-model-id | [Low/Medium/High] |

**Deprecation Rationale**:
- [Explain why these models were selected for removal]
- [User migration path if impact is High]

---

## 📊 Registry Overview (v[VERSION])

### Provider Distribution
- **Provider 1**: [N] models ([X]%)
- **Provider 2**: [N] models ([X]%)
- **Total**: [N] models

### Price Range
- **Ultra-budget**: $[X]-[Y]/MTok - [Models]
- **Budget**: $[X]-[Y]/MTok - [Models]
- **Mid-tier**: $[X]-[Y]/MTok - [Models]
- **Premium**: $[X]-[Y]/MTok - [Models]

### New Model Highlights
- **Most affordable**: [model] at $[X]/$[Y]
- **Most expensive**: [model] at $[X]/$[Y]
- **Best value** (cost/performance): [model]

---

## 🎯 Strategic Decisions

### Why Remove These Models?
1. [Reason 1]
2. [Reason 2]

### Why Add These Models?

**Evaluation Against Criteria**:

For each added model, confirm:
- ✅ Production-ready (not beta/preview)
- ✅ Official pricing published
- ✅ Mainstream/flagship OR >1% usage
- ✅ API accessible
- ✅ Stable (won't deprecate in 3 months)

**Specific Rationales**:
1. **[model-1]**: [Why added - fills gap, flagship, etc.]
2. **[model-2]**: [Why added]

### Why Remove These Models?

**Evaluation Against Deprecation Criteria**:

For each removed model, state which criteria triggered removal:
- [ ] Superseded by newer version
- [ ] Provider deprecated
- [ ] No pricing advantage
- [ ] Context window exceeded
- [ ] Usage <0.1%
- [ ] Breaking changes incoming

**Specific Rationales**:
1. **[old-model-1]**: Superseded by [new-model]. Same price, better performance.
2. **[old-model-2]**: Provider listed as "legacy" in docs (as of [date]).

### Models Considered But NOT Added

| Model | Provider | Status | Reason Not Added | Reconsider When |
|-------|----------|--------|------------------|-----------------|
| model-preview | Provider | Beta | Preview/beta status | GA release announced |
| niche-model | Provider | Production | Too niche (<1% usage) | Becomes mainstream |

**Note**: Models in this list may be added in future updates if criteria change.

---

## ✅ Data Quality Validation

### Sources Verified
- ✅ [Provider 1]: [Pricing URL], [Models URL]
- ✅ [Provider 2]: [Pricing URL], [Models URL]

### Confidence Levels
- **100% Confident**: [Providers with official docs]
- **95% Confident**: [Providers with API verification]
- **90% Confident**: [Providers via aggregators]

### Cross-Verification
- [ ] All prices verified against 2+ sources
- [ ] New models confirmed production-ready
- [ ] Context windows verified from official docs
- [ ] Cached pricing verified (where applicable)

---

## 🚨 Breaking Changes (if any)

**Impact Assessment**:
- [ ] Will break existing user simulations? [Yes/No]
- [ ] Requires frontend updates? [Yes/No]
- [ ] Requires documentation updates? [Yes/No]

**Migration Path**:
- [If applicable, describe how users should migrate]

---

## 🚀 Next Steps

1. **User Review**: Validate strategic decisions
2. **Commit**: Push to main with changelog
3. **Deploy**: Vercel auto-deploy (no action)
4. **Announce**: [If major update, announce on social media]

---

## 📝 Proposed Commit Message

```
[feat|fix]: update pricing registry to v[VERSION] - [summary]

[If breaking changes:]
Breaking Changes:
- Removed [models list]

Added Models:
- [Provider]: model1 ($X/$Y), model2 ($X/$Y)

[If pricing changes:]
Pricing Changes:
- model-id: $X/$Y → $A/$B ([reason])

[If corrections:]
Fixes:
- Corrected [model]: [what was wrong]

Data Sources:
- [Provider 1]: [URL]
- [Provider 2]: [URL]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 📋 Pre-Commit Checklist

- [ ] JSON validates: `cat public/data/llm-pricing.json | jq .`
- [ ] No duplicate IDs
- [ ] All prices are numbers (not strings)
- [ ] Required fields present on all models
- [ ] Metadata dates updated
- [ ] Version bumped correctly
- [ ] Sources cited in commit message
- [ ] Review document saved to `/thoughts/decisions/`

---

**Status**: ⏳ Awaiting user validation
**Created**: [DATE]
**Author**: Claude Sonnet 4.5
