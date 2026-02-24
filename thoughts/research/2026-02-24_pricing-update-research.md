# Pricing Update Research — 24 Feb 2026

## Sources Used
- OpenAI: https://developers.openai.com/api/docs/pricing/
- Anthropic: https://platform.claude.com/docs/en/about-claude/pricing
- Google: https://ai.google.dev/gemini-api/docs/pricing
- DeepSeek: https://api-docs.deepseek.com/quick_start/pricing
- Together AI (Llama): https://www.together.ai/pricing
- Mistral (web search + pricepertoken.com): $0.50/$1.50 Large 3, $0.030/$0.110 Small 3, $0.40/$2.00 Medium 3
- DeepSeek R1 confirmed via web search: $0.55 in / $2.19 out (unchanged)

---

## RAW DATA

### OpenAI (fetched directly)
| Model | Input | Cached Input | Output |
|---|---|---|---|
| gpt-5.2 | $1.75 | $0.175 | $14.00 |
| gpt-5.1 | $1.25 | $0.125 | $10.00 |
| gpt-5 | $1.25 | $0.125 | $10.00 |
| gpt-5-mini | $0.25 | $0.025 | $2.00 |
| gpt-5-nano | $0.05 | $0.005 | $0.40 |
| gpt-4.1 | $2.00 | $0.50 | $8.00 |
| gpt-4.1-mini | $0.40 | $0.10 | $1.60 |
| gpt-4.1-nano | $0.10 | $0.025 | $0.40 |
| gpt-4o | $2.50 | $1.25 | $10.00 |
| gpt-4o-mini | $0.15 | $0.075 | $0.60 |
| o1 | $15.00 | $7.50 | $60.00 |
| o3 | $2.00 | $0.50 | $8.00 |
| o3-mini | $1.10 | $0.55 | $4.40 |
| o4-mini | $1.10 | $0.275 | $4.40 |

Note: gpt-5.x family uses 10% caching discount; gpt-4.1 uses 25% discount; o-series uses 50% discount.

### Anthropic (fetched directly)
| Model | Input | Cache Read | Output |
|---|---|---|---|
| Claude Opus 4.6 | $5.00 | $0.50 | $25.00 |
| Claude Opus 4.5 | $5.00 | $0.50 | $25.00 |
| Claude Sonnet 4.6 | $3.00 | $0.30 | $15.00 |
| Claude Sonnet 4.5 | $3.00 | $0.30 | $15.00 |
| Claude Haiku 4.5 | $1.00 | $0.10 | $5.00 |
| Claude Haiku 3.5 | $0.80 | $0.08 | $4.00 |
| Claude Haiku 3 | $0.25 | $0.03 | $1.25 |

### Google Gemini (fetched directly)
| Model | Input (≤200k) | Output (≤200k) |
|---|---|---|
| Gemini 3.1 Pro Preview | $2.00 | $12.00 |
| Gemini 3 Flash Preview | $0.50 | $3.00 |
| Gemini 2.5 Pro | $1.25 | $10.00 |
| Gemini 2.5 Flash | $0.30 | $2.50 |
| Gemini 2.5 Flash-Lite | $0.10 | $0.40 |
| Gemini 2.0 Flash | $0.10 | $0.40 |
| Gemini 2.0 Flash-Lite | $0.075 | $0.30 |

Note: Gemini 2.5 Flash has 1M context window confirmed.

### DeepSeek (fetched + web search confirmed)
| Model | Cache Hit | Cache Miss | Output |
|---|---|---|---|
| deepseek-chat (V3.2) | $0.028 | $0.28 | $0.42 |
| deepseek-reasoner (R1) | $0.14 | $0.55 | $2.19 |

Note: R1 pricing confirmed unchanged via web search. V3.2 (chat) output dropped from $1.10 → $0.42.

### Meta Llama (Together AI)
| Model | Input | Output |
|---|---|---|
| Llama 4 Maverick | $0.27 | $0.85 |
| Llama 3.3 70B | $0.88 | $0.88 |
| Llama 3.1 405B | $3.50 | $3.50 |
| Llama 3.1 70B | $0.88 | $0.88 |
| Llama 3.1 8B | $0.18 | $0.18 |

### Mistral AI (web search + pricepertoken.com)
| Model | Input | Output |
|---|---|---|
| Mistral Large 3 | $0.50 | $1.50 |
| Mistral Medium 3 | $0.40 | $2.00 |
| Mistral Small 3 | $0.030 | $0.110 |

---

## COMPARISON VS CURRENT REGISTRY

### Price Corrections Needed
| Model | Field | Current | New | Delta |
|---|---|---|---|---|
| gpt-5.2 | cached_input_1m | 0.875 | 0.175 | -80% |
| gpt-5.1 | cached_input_1m | 0.625 | 0.125 | -80% |
| gpt-5-mini | cached_input_1m | 0.125 | 0.025 | -80% |
| deepseek-v3 | output_1m | 1.10 | 0.42 | -62% |
| deepseek-v3 | cached_input_1m | 0.07 | 0.028 | -60% |
| deepseek-v3 | input_1m | 0.27 | 0.28 | +4% |
| llama-3.3-70b | input_1m | 0.70 | 0.88 | +26% |
| llama-3.3-70b | output_1m | 0.80 | 0.88 | +10% |
| mistral-large | input_1m | 2.00 | 0.50 | -75% |
| mistral-large | output_1m | 6.00 | 1.50 | -75% |
| mistral-small | input_1m | 0.20 | 0.030 | -85% |
| mistral-small | output_1m | 0.60 | 0.110 | -82% |

### No Change Confirmed
- claude-opus-4.6, claude-sonnet-4.6, claude-haiku-4.5: all correct ✓
- gemini-3.1-pro ($2/$12), gemini-3-flash ($0.5/$3): correct ✓
- deepseek-r1 ($0.55/$2.19): confirmed unchanged ✓
- o3-mini ($1.1/$4.4): correct ✓

### New Models Candidates
OpenAI: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano, gpt-5-nano, o3, o4-mini
Google: gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash
Meta: llama-4-maverick
Mistral: mistral-medium-3

---

## CONFIDENCE LEVELS
- OpenAI: HIGH (official API docs fetched directly)
- Anthropic: HIGH (official platform docs fetched directly)
- Google: HIGH (official API docs fetched directly)
- DeepSeek V3.2: HIGH (official API docs + web search)
- DeepSeek R1: HIGH (web search multiple sources confirm $0.55/$2.19)
- Llama (Together AI): MEDIUM (Together AI is most widely used proxy but not Meta official)
- Mistral Large 3: MEDIUM (search result from pricepertoken.com, mistral.ai page JS-heavy)
- Mistral Small 3: MEDIUM (same)
- Mistral Medium 3: MEDIUM (pricepertoken.com)
