# Scripts Directory

This directory contains automation scripts and procedures for maintaining the LLM Cost Engine.

---

## 📋 Pricing Update System

### Quick Start

When you need to update pricing:

**User says**: "aggiorna prezzi" or "update pricing to Feb 11, 2026"

**Claude follows**: `update-pricing-procedure.md` → automated research → generates review → user validates → commits

---

## 📁 Files

### `pricing-sources.json`
**Purpose**: Registry of all official pricing pages and documentation URLs

**Contains**:
- OpenAI: Pricing page, models docs, API docs
- Anthropic: Pricing page, models overview
- Google: Gemini API pricing, models docs
- DeepSeek: Pricing API docs
- Mistral: Pricing page, model docs
- Meta: Llama docs, Together AI pricing
- Cohere: Pricing page (for future consideration)

**Usage**:
```bash
# View all sources
cat scripts/pricing-sources.json | jq .

# Get OpenAI pricing URL
cat scripts/pricing-sources.json | jq -r '.providers.openai.pricing_page'
```

**When to Update**: When a provider changes their documentation structure or pricing page URL.

---

### `update-pricing-procedure.md`
**Purpose**: Step-by-step procedure for Claude Code to update pricing

**Contains**:
- Phase 1: Multi-agent research (competitive-analyst, trend-analyst, market-researcher)
- Phase 2: Analysis and comparison with current registry
- Phase 3: Generate review document
- Phase 4: User validation
- Phase 5: Apply changes to JSON
- Phase 6: Commit with structured changelog

**Key Features**:
- Decision matrix for adding/removing models
- Validation checklist
- Version bump rules
- Common pitfalls and solutions
- Model addition criteria

**Usage**: Claude Code follows this procedure automatically when user requests pricing update.

---

### `pricing-update-template.md`
**Purpose**: Template for generating review documents

**Contains**:
- Executive summary section
- Pricing corrections table
- Models added/removed lists
- Strategic decisions rationale
- Data quality validation
- Proposed commit message
- Pre-commit checklist

**Usage**: Claude Code fills this template during Phase 3 of the update procedure.

**Output Location**: `/thoughts/decisions/[DATE]_pricing-update-review.md`

---

## 🔄 Typical Update Flow

```
1. User: "aggiorna prezzi"
   ↓
2. Claude launches multi-agent-coordinator
   - competitive-analyst: Scrapes official pricing pages
   - trend-analyst: Identifies new/deprecated models
   - market-researcher: Checks caching, context changes
   ↓
3. Claude reads current registry (llm-pricing.json)
   ↓
4. Claude compares research vs current → identifies changes
   ↓
5. Claude generates review document from template
   ↓
6. User reviews document
   ↓
7. User approves OR requests modifications
   ↓
8. Claude applies changes to llm-pricing.json
   ↓
9. Claude commits with structured changelog
   ↓
10. Vercel auto-deploys updated pricing
```

**Time**: ~10-15 minutes end-to-end

---

## 🎯 Design Principles

### 1. **Human-in-the-Loop**
- Claude automates research and proposal
- User validates strategic decisions
- No auto-commits without approval

### 2. **Source of Truth**
- Official provider pages are authoritative
- Cross-verify with 2+ sources for accuracy
- Cite sources in commit messages

### 3. **Incremental Updates**
- Small, focused updates preferred
- Clear changelog for each version
- Semantic versioning (SemVer)

### 4. **Quality over Speed**
- Validate all prices before committing
- Skip experimental models
- Remove deprecated models proactively

---

## 🛠️ Future Enhancements

### Planned
- [ ] `scrape-prices.js`: Node.js script for automated scraping
- [ ] `validate-registry.js`: JSON schema validation
- [ ] `compare-versions.js`: Diff tool for registry versions
- [ ] GitHub Action: Weekly automated price checks

### Considered
- [ ] API integrations: Direct provider API calls for live pricing
- [ ] Price history: Track pricing changes over time in separate file
- [ ] Alert system: Notify on significant price drops

---

## 📚 Related Documentation

- **Pricing Registry**: `../public/data/llm-pricing.json`
- **Research Outputs**: `../thoughts/research/`
- **Decision Logs**: `../thoughts/decisions/`
- **Main README**: `../README.md`

---

## 🤝 Contributing

When improving this system:

1. Update `pricing-sources.json` if new providers added
2. Update `update-pricing-procedure.md` if process changes
3. Update `pricing-update-template.md` if review format changes
4. Test the full flow before committing

---

**Last Updated**: 2026-02-11
**Maintained By**: Claude Code + Human Oversight
