# LLM Pricing Registry Update - v1.4.0 (Feb 11, 2026)

## Executive Summary
- **Version**: 1.3.0 → 1.4.0
- **Models**: 16 → 20 (net +4)
- **Added**: 9 new models
- **Removed**: 5 legacy models
- **Corrected**: 3 Claude pricing errors (from Gemini's initial edits)

---

## ✅ Changes Made

### 1. **Pricing Corrections** (Critical)
Claude models had incorrect pricing from Gemini's initial edits. Corrected based on official docs:

| Model | Gemini's Price | Correct Price | Source |
|-------|----------------|---------------|--------|
| claude-opus-4.6 | $15/$75 ❌ | $5/$25 ✅ | [Claude Docs](https://platform.claude.com/docs/en/about-claude/models/overview) |
| claude-haiku-4.5 | $0.8/$4.0 ❌ | $1/$5 ✅ | [Claude Docs](https://platform.claude.com/docs/en/about-claude/models/overview) |
| Context windows | 500K ❌ | 200K ✅ | [Claude Docs](https://platform.claude.com/docs/en/about-claude/models/overview) |

### 2. **Models Added** (9 new)

#### OpenAI (3 new)
- **o1-mini**: $3/$12 - Mid-tier reasoning model
- **gpt-4.1**: $2/$8 - Updated GPT-4 variant
- **gpt-4-turbo**: $10/$30 - High-performance model

#### Google (3 new)
- **gemini-2.5-pro**: $1.25/$10 - Mid-tier Gemini
- **gemini-3-pro**: $2/$12 - Latest Pro model
- **gemini-3-flash**: $0.50/$3 - Latest Flash model

#### Anthropic (3 new - Latest generation)
- **claude-sonnet-4.5**: $3/$15 - Latest Sonnet
- **claude-haiku-4.5**: $1/$5 - Latest Haiku (fastest)
- **claude-opus-4.6**: $5/$25 - Latest Opus (most intelligent)

### 3. **Models Removed** (5 legacy)

| Removed | Reason | Replaced By |
|---------|--------|-------------|
| claude-3.5-sonnet | Legacy | claude-sonnet-4.5 |
| claude-3.5-haiku | Obsolete | claude-haiku-4.5 |
| claude-sonnet-4 | Superseded | claude-sonnet-4.5 |
| claude-opus-4 | Superseded | claude-opus-4.6 |
| o1 | Expensive, rarely used | o1-mini, o3-mini |

---

## 📊 Registry Overview (v1.4.0)

### Provider Distribution
- **OpenAI**: 6 models (30%)
- **Google**: 6 models (30%)
- **Anthropic**: 3 models (15%)
- **DeepSeek**: 2 models (10%)
- **Mistral**: 2 models (10%)
- **Meta**: 1 model (5%)

### Price Range
- **Ultra-budget**: $0.075-0.50/MTok (Gemini Flash, DeepSeek)
- **Budget**: $0.5-2/MTok (GPT-4o mini, Claude Haiku, Mistral)
- **Mid-tier**: $2-5/MTok (GPT-4o, Claude Sonnet, Gemini Pro)
- **Premium**: $5-12/MTok (Claude Opus, GPT-4 Turbo)

---

## 🎯 Strategic Decisions

### Why Remove Legacy Models?
1. **User confusion**: Having both "claude-3.5-sonnet" and "claude-sonnet-4.5" is confusing
2. **Maintenance burden**: More models = more pricing updates
3. **Focus on latest**: Users want the newest, best-performing models
4. **SEO clarity**: Clear model hierarchy improves content discoverability

### Why Add These Specific Models?
1. **o1-mini**: Strong reasoning at 1/5 the cost of o1
2. **gpt-4.1**: Fills gap between 4o and Turbo
3. **Gemini 3.x**: Latest generation, competitive pricing
4. **Claude 4.5/4.6**: Anthropic's newest flagship models

### Models Considered But NOT Added
- **GPT-4.3**: Does not exist (confirmed via research)
- **Claude 3 Haiku**: Too old, replaced by 3.5 and 4.5
- **Gemini 1.0**: Deprecated
- **Cohere Command R+**: Not mainstream enough for initial registry

---

## ✅ Data Quality Validation

### Sources Verified
- ✅ OpenAI: [Pricing Page](https://platform.openai.com/docs/pricing), [Models Docs](https://developers.openai.com/api/docs/models)
- ✅ Anthropic: [Pricing Page](https://anthropic.com/pricing), [Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- ✅ Google: [Gemini API Pricing](https://ai.google.dev/pricing), [Models Docs](https://ai.google.dev/gemini-api/docs/models)
- ✅ DeepSeek, Mistral, Meta: Third-party aggregators (PricePerToken, official APIs)

### Confidence Levels
- **100% Confident**: OpenAI, Anthropic, Google (official docs)
- **95% Confident**: DeepSeek, Mistral (official APIs)
- **90% Confident**: Meta Llama (via Together AI pricing)

---

## 🚀 Next Steps

1. **Gemini Review**: Validate strategic decisions and pricing
2. **Commit**: Push to main with changelog
3. **Deploy**: Vercel auto-deploy (no action needed)
4. **Price Snapshot**: Next Sunday's cron will snapshot these new models

---

## 📝 Proposed Commit Message

```
feat: update pricing registry to v1.4.0 - add 9 models, remove 5 legacy

Breaking Changes:
- Removed legacy Claude models (3.5 Sonnet/Haiku, Sonnet/Opus 4)
- Removed OpenAI o1 (replaced by o1-mini, o3-mini)

Added Models:
- OpenAI: o1-mini, gpt-4.1, gpt-4-turbo
- Claude: Sonnet 4.5, Haiku 4.5, Opus 4.6
- Google: Gemini 2.5 Pro, 3 Pro, 3 Flash

Fixes:
- Corrected Claude Opus 4.6 pricing: $15/$75 → $5/$25
- Corrected Claude Haiku 4.5 pricing: $0.8/$4 → $1/$5
- Corrected Claude context windows: 500K → 200K

Data Sources:
- OpenAI: https://platform.openai.com/docs/pricing
- Anthropic: https://platform.claude.com/docs/en/about-claude/models/overview
- Google: https://ai.google.dev/pricing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

**Awaiting Gemini's final validation before commit.**
