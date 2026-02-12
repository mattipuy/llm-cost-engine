# LLM Pricing Update Procedure

**Purpose**: Standardized process to update `public/data/llm-pricing.json` when user requests pricing updates.

**Trigger**: User says "aggiorna prezzi" or "update pricing to [date]"

---

## 🚀 Quick Start (For Claude Code)

When user requests pricing update:

```bash
# 1. Run multi-agent research (5-10 min)
# 2. Generate review document
# 3. Present to user for validation
# 4. Apply changes
# 5. Commit with changelog
```

---

## 📋 Step-by-Step Procedure

### PHASE 1: Research (Use Multi-Agent Coordinator)

**Action**: Launch 3 agents in parallel to gather current data.

**Agent Configuration**:

```typescript
Task: multi-agent-coordinator
Description: "Research current LLM pricing (Feb 2026)"
Prompt: |
  Coordinate research on current LLM model pricing and new models.

  Launch these agents in PARALLEL:

  1. competitive-analyst: Research current pricing for:
     - OpenAI (GPT-5.2, GPT-5.1, GPT-5 Mini, o3-mini, o4-mini)
     - Anthropic (Claude Opus 4.6, Sonnet 4.5, Haiku 4.5)
     - Google (Gemini 3 Pro, 3 Flash - check if 2.x/1.x are deprecated)
     - DeepSeek (V3, R1)
     - Mistral (Large, Small)
     - Meta (Llama 3.3 70B, check for 3.4/4.0)

     Use official sources from scripts/pricing-sources.json
     Focus on: input/output price per 1M tokens, cached pricing, batch pricing

     CRITICAL: Check deprecation pages FIRST:
     - OpenAI: https://developers.openai.com/api/docs/deprecations
     - Google: https://ai.google.dev/gemini-api/docs/deprecations
     - Anthropic: https://platform.claude.com/docs/en/about-claude/model-deprecations

  2. trend-analyst: Identify NEW models released since last update:
     - Check provider announcements
     - Determine if production-ready vs experimental
     - Flag any deprecated models

  3. market-researcher: Research changes to:
     - Prompt caching support and pricing
     - Context window changes
     - Any pricing model changes (tiered, volume discounts)

  Output: Structured data with sources for each price point.
```

**Expected Output Location**: `/thoughts/research/[DATE]_*.md`

---

### PHASE 2: Analysis & Model Evaluation

**Action**: Review agent outputs and compare with current registry.

#### 2.1 Price Changes Analysis

**Checklist**:
- [ ] Read current registry: `public/data/llm-pricing.json`
- [ ] Compare prices: Identify changes
- [ ] Cross-check discrepancies: Use 2+ sources for each price

**Decision Matrix**:

| Scenario | Action |
|----------|--------|
| Price changed | Update if verified by 2+ sources |
| Conflicting prices | Use official provider page as source of truth |
| Price drop >20% | Flag for immediate update (user impact) |
| Price increase >20% | Verify twice (may be error) |

#### 2.1.5 Deprecation Check (MANDATORY)

**Action**: Check official deprecation pages BEFORE evaluating models.

**Official Deprecation Sources**:

| Provider | Deprecation Page | Check For |
|----------|------------------|-----------|
| **OpenAI** | [Deprecations](https://developers.openai.com/api/docs/deprecations) | Shutdown dates for gpt-4*, gpt-3.5*, o1* |
| **Google** | [Gemini Deprecations](https://ai.google.dev/gemini-api/docs/deprecations) | Shutdown dates for gemini-1.5*, 2.0*, 2.5* |
| **Anthropic** | [Model Deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) | Active until dates for claude-* |
| **DeepSeek** | Check API docs | Usually no deprecation schedule |
| **Mistral** | Check API docs | Usually no deprecation schedule |

**Deprecation Decision Tree**:

```
Model in registry?
├─ YES
│  └─ Check deprecation page
│     ├─ Shutdown date < 6 months? → ❌ REMOVE (imminent deprecation)
│     ├─ Shutdown date < 12 months? → ⚠️ MARK for next update
│     └─ No shutdown date / Active → ✅ KEEP
└─ NO (new model candidate)
   └─ Check if it's replacing deprecated model → ✅ PRIORITIZE
```

**Example Queries**:
- "Is gemini-2.0-flash deprecated?" → Check Google deprecation page
- "When does gpt-4-turbo shut down?" → Check OpenAI deprecations
- "Is claude-sonnet-4.5 active?" → Check Anthropic model deprecations

#### 2.2 New Models Evaluation

**Philosophy: "Less is More"**

⚠️ **CRITICAL**: We curate, we don't collect. The registry is NOT a comprehensive list of all LLM models.

**Curation Goals**:
- ✅ 1-2 flagship models per provider
- ✅ 1 budget model per provider (if available)
- ✅ 1 reasoning model (if applicable)
- ❌ No legacy/deprecated models
- ❌ No redundant variants (e.g., gpt-4.1 when gpt-5.1 exists)
- ❌ No preview/beta models (wait for GA)
- ❌ No niche models (RAG-only, code-only, ultra-budget nano variants)

**Target**: ~12-16 models total across all providers

**Action**: Evaluate each new model found by trend-analyst against addition criteria.

**Evaluation Template** (for each new model):

```markdown
## [Model Name] - [Provider]

**Status**: [Production/Beta/Preview]
**Pricing**: $[X]/$[Y] per 1M tokens
**Context**: [N]K tokens
**Released**: [Date]

**Evaluation**:
- [ ] Production-ready? (not beta/preview/experimental)
- [ ] Official pricing published?
- [ ] Mainstream/flagship? (or >1% API usage)
- [ ] API accessible? (not web-only)
- [ ] Stable? (not deprecated within 3 months)

**Comparison**:
- Similar to: [existing model]
- Price positioning: [cheaper/same/more expensive]
- Unique value: [what it offers vs existing]

**Recommendation**: ✅ ADD / ⚠️ CONSIDER LATER / ❌ SKIP
**Rationale**: [Why]
```

**Common "Consider Later" Cases**:
- Preview/beta models (wait for GA release)
- Niche models (RAG-specific, code-only, etc.)
- Experimental models (no pricing guarantee)
- Variants with marginal differences (gpt-4o-2024-08-06 vs gpt-4o)

**Common "Skip" Cases**:
- Deprecated within announcement
- Web-only models (no API access)
- Models without official pricing
- One-off research models

**Real-World Examples (Feb 2026 Update)**:

✅ **ADDED** (met all criteria):
- gpt-5.2 → Flagship coding/agentic, replaces gpt-4o
- gpt-5.1 → Flagship reasoning, replaces gpt-4.1
- gpt-5-mini → Budget GPT-5, replaces gpt-4o-mini

❌ **SKIPPED** (failed criteria):
- gpt-5.2-pro → Too expensive, niche use case
- gpt-5-nano → Ultra-budget niche, overlaps with mistral-small
- gpt-4.1-mini → Redundant with gpt-5-mini (newer, better)
- o3 / o3-pro → Too expensive for reasoning ($15/$60)
- o4-mini → Overlaps with o3-mini, no clear differentiation
- gemini-2.5-flash → Deprecated Jun 2026 (too soon)

#### 2.3 Legacy Models Evaluation

**Action**: Evaluate each existing model for potential removal.

**Deprecation Criteria** (flag for removal if ANY of these):

| Criterion | Example |
|-----------|---------|
| **Superseded by newer version** | claude-3.5-sonnet → claude-sonnet-4.5 |
| **Provider deprecated** | Listed as "legacy" on provider docs |
| **No pricing advantage** | Same price as newer, better model |
| **Context window exceeded** | 8K model when 128K+ is standard |
| **Usage <0.1%** | Check analytics if available |
| **Breaking changes incoming** | Provider announced end-of-life |

**Evaluation Template** (for each existing model):

```markdown
## [Model ID] - Status Check

**Current in Registry**: Yes
**Provider Status**: [Active/Legacy/Deprecated]
**Last Price Update**: [Date]

**Superseded By**: [new-model-id] OR None
**Still Listed on Provider Docs**: Yes/No
**Price Competitive**: Yes/No
**Unique Value**: [What it offers that others don't]

**Recommendation**: ✅ KEEP / ⚠️ MARK LEGACY / ❌ REMOVE
**Rationale**: [Why]

**If REMOVE**:
- Replacement: [model-id]
- User Impact: [High/Medium/Low]
- Migration Path: [How users should migrate]
```

**Keep Model If**:
- Still listed as "active" by provider
- Has unique price/performance position
- No direct replacement exists
- Used in >5% of simulations (if data available)

**Remove Model If**:
- Provider lists as "legacy" or "deprecated"
- Superseded by newer version with same/better specs
- Price/performance no longer competitive
- Breaking change required (e.g., API endpoint removed)

**Real-World Examples (Feb 2026 Update)**:

❌ **REMOVED** (10 models):

**OpenAI (5 removed)**:
- gpt-4o → Superseded by gpt-5.2 (cheaper, better)
- gpt-4o-mini → Superseded by gpt-5-mini
- o1-mini → No longer in API docs, replaced by o3-mini
- gpt-4.1 → Redundant with gpt-5.1 (newer generation)
- gpt-4-turbo → Legacy, expensive ($10/$30 vs gpt-5.2 $1.75/$14)

**Google (4 removed)**:
- gemini-2.0-flash → Deprecated, shutdown Mar 31, 2026
- gemini-2.5-pro → Deprecated, shutdown Jun 17, 2026
- gemini-1.5-pro → Old generation, replaced by gemini-3-pro
- gemini-1.5-flash → Old generation, replaced by gemini-3-flash

**Anthropic (0 removed)**:
✅ All claude-4.5/4.6 models active until 2026-2027

**Key Insight**: When a provider releases a new generation (GPT-4 → GPT-5, Gemini 2.x → 3.x),
remove ALL previous generation models unless they have unique value (e.g., cheaper price point not covered).

#### 2.4 Generate Comparison Summary

**Action**: Create side-by-side comparison of changes.

**Output Format**:

```markdown
## Registry Changes Summary

### Pricing Updates ([N] models)
| Model | Old Price | New Price | Change | Reason |
|-------|-----------|-----------|--------|--------|
| model-1 | $2/$10 | $1.5/$8 | -25%/-20% | Provider discount |

### Models to ADD ([N] new)
| Model | Price | Rationale | Impact |
|-------|-------|-----------|--------|
| new-model-1 | $X/$Y | Latest flagship, replaces old-model | High |

### Models to REMOVE ([N] legacy)
| Model | Price | Replacement | User Impact |
|-------|-------|-------------|-------------|
| old-model-1 | $X/$Y | new-model-1 | Low (direct replacement) |

### Models to KEEP (no change)
- [List of models with no pricing/status changes]

### Models CONSIDERED but SKIPPED
| Model | Reason Skipped | Reconsider When |
|-------|----------------|-----------------|
| model-preview | Beta status | GA release |
```

---

### PHASE 3: Generate Review Document

**Action**: Create review document for user validation.

**Template**: Use `scripts/pricing-update-template.md`

**Key Sections**:
1. **Summary**: # changes, # additions, # removals
2. **Pricing Changes**: Table with old vs new
3. **Models Added**: List with rationale
4. **Models Removed**: List with reason
5. **Strategic Decisions**: Why these changes?
6. **Data Quality**: Confidence levels, sources
7. **Proposed Commit Message**

**Output Location**: `/thoughts/decisions/[DATE]_pricing-update-review.md`

---

### PHASE 4: User Validation

**Action**: Present review document to user.

**Prompt Template**:
```
📋 Pricing Update Review Ready!

File: /thoughts/decisions/[DATE]_pricing-update-review.md

Summary:
- Version: X.Y.Z → X.Y+1.Z
- Models: N → M (net +/-X)
- Pricing changes: N models
- New models: N added
- Removed models: N legacy

Review the document and let me know:
1. Approve all changes?
2. Modify anything?
3. Remove different models?

Once approved, I'll apply changes and commit.
```

---

### PHASE 5: Apply Changes

**Action**: Update `llm-pricing.json` based on approved review.

**Steps**:
1. **Pricing corrections**: Edit existing models
2. **Add new models**: Insert in provider order
3. **Remove legacy models**: Delete deprecated entries
4. **Update metadata**:
   - Bump version (minor for additions, patch for price-only updates)
   - Update `last_updated` and `last_verified` dates

**Model Order** (keep consistent):
```
1. OpenAI (by release date, newest first)
2. Anthropic (by tier: Opus → Sonnet → Haiku)
3. Google (by generation: newest first)
4. DeepSeek (by release date)
5. Meta (by model size)
6. Mistral (by tier: Large → Small)
7. Cohere (if added)
```

---

### PHASE 6: Commit

**Action**: Commit with structured changelog.

**Commit Message Template**:
```
feat|fix: update pricing registry to vX.Y.Z - [summary]

[Breaking Changes: (if removing models)]
- Removed [models list]

[Added Models:]
- Provider: model1, model2, model3

[Pricing Changes:]
- model-id: $X → $Y (reason)

[Fixes:]
- Corrected [model]: [what was wrong]

Data Sources:
- [Provider]: [URL]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Commit Type**:
- `feat:` if adding/removing models (version bump)
- `fix:` if only correcting prices (no structural changes)
- `chore:` if only updating metadata dates

---

## 🛡️ Validation Checklist

Before committing, verify:

- [ ] **JSON Valid**: `cat public/data/llm-pricing.json | jq .` succeeds
- [ ] **No Duplicate IDs**: `grep '"id":' public/data/llm-pricing.json | sort | uniq -d` returns empty
- [ ] **Price Format**: All prices are numbers (not strings)
- [ ] **Required Fields**: Every model has `id, name, provider, pricing{input_1m, output_1m}, capabilities{context_window, latency_index}`
- [ ] **Metadata Updated**: `last_updated` and `last_verified` match today
- [ ] **Version Bumped**: Version incremented correctly
- [ ] **Sources Cited**: All price changes have source URLs in commit message

---

## 📦 Version Bump Rules

Follow Semantic Versioning:

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Add new models | MINOR (X.Y.0 → X.Y+1.0) | 1.3.0 → 1.4.0 |
| Remove models | MAJOR (X.0.0 → X+1.0.0) | 1.4.0 → 2.0.0 |
| Update prices only | PATCH (X.Y.Z → X.Y.Z+1) | 1.4.0 → 1.4.1 |
| Add + Remove models | MINOR (X.Y.0 → X.Y+1.0) | 1.4.0 → 1.5.0 |

---

## 🚨 Common Pitfalls

### 1. **Conflicting Prices**
- **Problem**: Two sources show different prices
- **Solution**: Use official provider page as source of truth. If still conflicting, choose lower price and add note in commit.

### 2. **Experimental Models**
- **Problem**: Provider releases "preview" or "beta" model
- **Solution**: Skip. Only add production-ready models with stable pricing.

### 3. **Context-Tiered Pricing**
- **Problem**: Google charges different prices for different context lengths
- **Solution**: Use base tier pricing (≤200K tokens). Add note in model description if needed.

### 4. **Third-Party Platform Pricing**
- **Problem**: AWS Bedrock/Vertex AI prices differ from direct API
- **Solution**: Use direct API pricing from provider's official page.

### 5. **Missing Cached Pricing**
- **Problem**: Provider doesn't publish cached pricing
- **Solution**: Omit `cached_input_1m` field. Don't assume or calculate.

---

## 📝 Model Addition Criteria

Only add models that meet ALL criteria:

1. ✅ **Production-ready**: Not preview, beta, or experimental
2. ✅ **Official pricing**: Published on provider's official page
3. ✅ **Mainstream**: Used by >1% of LLM API users (or flagship model)
4. ✅ **API accessible**: Available via REST API (not just web UI)
5. ✅ **Stable**: Not deprecated within 3 months of release

**Examples**:
- ✅ Add: GPT-4o, Claude Opus 4.6, Gemini 2.0 Flash
- ❌ Skip: GPT-4o-2024-08-06-preview-alpha, claude-instant-1 (deprecated), gemini-nano (device-only)

---

## 🔄 Frequency Guidelines

**Recommended Update Schedule**:
- **Weekly**: Check for price changes (automated cron)
- **Monthly**: Add new production models
- **Quarterly**: Remove deprecated models

**When to Update Immediately**:
- Major provider announcement (e.g., OpenAI DevDay)
- Price drop >20% (user-facing impact)
- New flagship model release
- Critical pricing error reported

---

## 💾 Files Modified

This procedure typically touches:

1. `public/data/llm-pricing.json` - The registry (always)
2. `thoughts/research/[DATE]_*.md` - Agent research outputs (created)
3. `thoughts/decisions/[DATE]_pricing-update-review.md` - Review doc (created)
4. Git commit message - Changelog (created)

---

## 🤝 Collaboration with Gemini

**When to Consult Gemini**:
1. **Strategic decisions**: Add/remove models that affect user experience
2. **Ambiguous pricing**: Multiple valid interpretations
3. **Major version bump**: Removing widely-used models
4. **Naming conflicts**: Provider uses confusing model names

**When NOT to Consult Gemini**:
1. **Simple price updates**: Provider published new price, straightforward update
2. **Metadata updates**: Changing dates, version bumps
3. **Obvious additions**: Provider releases new flagship model with clear pricing

---

## 📚 Quick Reference

**Key Files**:
- Pricing registry: `public/data/llm-pricing.json`
- Sources config: `scripts/pricing-sources.json`
- This procedure: `scripts/update-pricing-procedure.md`
- Review template: `scripts/pricing-update-template.md`

**Key Commands**:
```bash
# Validate JSON
cat public/data/llm-pricing.json | jq .

# Count models
grep '"id":' public/data/llm-pricing.json | wc -l

# List all model IDs
grep '"id":' public/data/llm-pricing.json | grep -v metadata

# Check for duplicates
grep '"id":' public/data/llm-pricing.json | sort | uniq -d

# View recent pricing history
git log --oneline public/data/llm-pricing.json | head -10
```

---

**Last Updated**: 2026-02-11
**Procedure Version**: 1.0.0
**Next Review**: 2026-03-11
