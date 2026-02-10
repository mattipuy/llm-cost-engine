# Brief per Gemini: Strategia Micro-Tools

> Mattia: incolla questo in una sessione Gemini (con il System Prompt gia' caricato).

---

## Contesto

Abbiamo capito che LLM Cost Engine non e' un SaaS ma una **fabbrica di asset**. Il core (pricing data, SSR infrastructure, ValueScore) e' riutilizzabile per creare micro-tools specializzati che **moltiplicano la superficie SEO** senza duplicare la codebase.

Oggi abbiamo una sola route tool: `/tools/chatbot-simulator`.
Vogliamo espandere a 3-4 tool sotto `/tools/*`, ognuno con:
- Keyword target proprie (intento di ricerca diverso)
- JSON-LD schema dedicato
- Cross-linking verso gli altri tool
- Stesso look & feel, stesso data layer

## I 3 Micro-Tools Proposti

### Tool 1: LLM Context Window Comparator
**Idea**: Visualizzare quale modello "entra" nel tuo use case in base alla dimensione del contesto necessario.
**User story**: "Ho documenti da 50k token. Quali modelli li supportano? Quanto costa?"
**Dati disponibili nel JSON**: `context_window` gia' presente per ogni modello. Range attuale: 32,000 (Mistral Small) - 2,000,000 (Gemini 1.5 Pro).

### Tool 2: Prompt Caching ROI Estimator
**Idea**: Calculator focalizzato solo sul risparmio da caching. Input: quanto del tuo prompt e' statico (system prompt, knowledge base), volume chiamate, modello. Output: costo con/senza cache, ROI, break-even.
**User story**: "Uso un system prompt di 4k token. Vale la pena abilitare il caching su GPT-4o?"
**Dati disponibili nel JSON**: `cached_input_1m` gia' presente per tutti i modelli. Discount implicito calcolabile: `1 - (cached_input_1m / input_1m)`.

### Tool 3: Batch API Savings Calculator
**Idea**: Calculator per stimare quanto risparmi usando le Batch API (disponibili su OpenAI, Anthropic, Google) vs real-time.
**User story**: "Ho 10k richieste/giorno non urgenti. Quanto risparmio con la Batch API?"
**Dati NON disponibili nel JSON**: servono i prezzi batch (`batch_input_1m`, `batch_output_1m`). Da aggiungere al registry. Non tutti i provider offrono batch pricing.

## Dati nel JSON Registry Attuale

```
15 modelli, 7 provider. Per ogni modello:
- id, name, provider
- pricing: { input_1m, output_1m, cached_input_1m }
- capabilities: { context_window, latency_index }
```

Modelli con context_window notevoli:
- Gemini 1.5 Pro: 2,000,000
- Gemini 2.0 Flash: 1,000,000
- Gemini 1.5 Flash: 1,000,000
- Claude 3.5 Sonnet/Haiku/Sonnet 4/Opus 4: 200,000
- o1, o3-mini: 200,000
- GPT-4o, GPT-4o-mini, DeepSeek, Llama, Mistral Large: 128,000
- Mistral Small: 32,000

Modelli con cache discount piu' aggressivo (calcolato):
- Anthropic: 90% discount (es. Claude 3.5 Sonnet: $3.00 -> $0.30)
- DeepSeek: 74% discount (es. V3: $0.27 -> $0.07)
- Google: 75% discount (es. Gemini 2.0 Flash: $0.10 -> $0.025)
- OpenAI: 50% discount (es. GPT-4o: $2.50 -> $1.25)
- Mistral: 50% discount

## Cosa serve da te (Gemini)

Per **ognuno dei 3 tool**, produci una spec nel formato standard con:

1. **Obiettivo** - Una frase chiara
2. **Target User** - Chi e perche'
3. **Requisiti Funzionali** - RF-1, RF-2, etc.
4. **Input/Output** - Tabella con campo, tipo, default, validazione
5. **Logica di Calcolo** - Formula deterministica (no heuristic)
6. **UI/UX** - Layout, interazioni, stati. Deve essere piu' snello del chatbot-simulator (max 1 screen, no scroll).
7. **SEO Impact** - Target keyword (3-5 per tool), search intent, meta title/description suggeriti, JSON-LD schema type
8. **Cross-linking** - Come questo tool linka agli altri (CTA, callout, breadcrumb)
9. **Edge Cases** - EC-1, EC-2, etc.
10. **Criteri di Successo** - Checklist

## Vincoli Tecnici (per Claude Code)

- Route: `/tools/[tool-slug]`
- Standalone component Angular 19 con Signals e OnPush
- Dati da `PricingDataService` (stesso JSON, stesso TransferState)
- JSON-LD dedicato per ogni tool (SoftwareApplication o WebApplication)
- Dynamic meta tags per programmatic SEO
- Mobile-first, max 1 viewport di altezza ideale (no scroll per l'output)
- Ogni tool deve avere il Price Alert bell icon (riuso `PriceAlertModalComponent`)
- EU Trust signals nel footer (riuso pattern esistente)

## Domande aperte per te

1. **Priorita'**: quale dei 3 tool ha il miglior rapporto keyword_volume / effort_implementativo? Partiremo da quello.
2. **Batch pricing**: ha senso come tool 3 dato che non tutti i provider lo offrono? O c'e' un tool alternativo piu' interessante?
3. **Cross-linking hub**: serve una landing page `/tools` che lista tutti i tool? O basta il cross-linking reciproco?
4. **Naming SEO**: i nomi proposti sono ottimali per SEO o suggerisci varianti?

## Output atteso

3 spec separate (una per tool), ordinate per priorita' consigliata. Formato `docs/specs/0X-[tool-name].md`.

---

_Brief preparato da Claude Code. 2026-02-08._
