# Claude Code Session Bootstrap - LLM Cost Engine

> Incolla questo documento all'inizio di una nuova sessione Claude Code per ottenere il contesto completo del progetto senza dover riesaminare l'intera codebase.
>
> **Nota**: le istruzioni operative sono in `CLAUDE.md` (caricato automaticamente). Questo documento e' complementare: fornisce lo **stato corrente**, la **mappa dei file** e le **convenzioni** che una nuova sessione deve conoscere.

---

## Stato del Progetto (Febbraio 2026)

**LLM Cost Engine** - Asset factory di micro-tool Angular 19 SSR per analisi TCO deterministiche di deployment LLM enterprise. Non e' un SaaS: e' una rete di tool SEO-driven con core condiviso.

- **Live**: https://llm-cost-engine.vercel.app
- **Revenue**: $0 (pre-revenue, infrastructure-building)
- **Build**: `ng build` passa senza errori (solo warning su CommonJS/jsPDF preesistenti)
- **Deploy**: Vercel, region `fra1`
- **Tools**: 4 micro-tool live + 1 insights page + 1 verify page + 1 unsubscribe page = 8 prerendered routes

### AI Collaboration Team

| AI | Ruolo | Prompt |
| --- | --- | --- |
| **Claude Code** (Tu) | Lead Dev - unico autorizzato a scrivere codice | `CLAUDE.md` (auto-loaded) |
| **Gemini** | Architect/PM - spec, SEO strategy, business | `docs/GEMINI_SYSTEM_PROMPT.md` |
| **ChatGPT** | Content Strategist - blog, copy, competitive intel | `docs/CHATGPT_SYSTEM_PROMPT.md` |

---

## Stack Tecnico

```
Frontend:  Angular 19.2 (Standalone Components, Signals, SSR, OnPush)
Backend:   Supabase (PostgreSQL + Edge Functions in Deno)
Styling:   Tailwind CSS
Deploy:    Vercel (fra1, Edge)
Data:      Static JSON registry (public/data/llm-pricing.json) v1.3.0
Email:     Resend (transactional emails)
CI/CD:     GitHub Actions (weekly price snapshots)
PDF:       jsPDF + jspdf-autotable (client-side, dynamic import)
```

### Dipendenze chiave (`package.json`)

- `@angular/*: ^19.2.0`
- `@supabase/supabase-js: ^2.95.3`
- `jspdf: ^4.0.0`, `jspdf-autotable: ^5.0.7`
- `rxjs: ~7.8.0`

### Environment files

- `src/environments/environment.ts` - Dev (localhost:54321)
- `src/environments/environment.prod.ts` - Prod (placeholder `__SUPABASE_URL__`, `__SUPABASE_ANON_KEY__`)

---

## Mappa dei File (Aree Critiche)

### Routes (`src/app/app.routes.ts`)

| Path | Component | Note |
| --- | --- | --- |
| `/tools/chatbot-simulator` | `ChatbotSimulatorComponent` | Homepage, lazy-loaded |
| `/tools/caching-roi` | `CachingRoiComponent` | Prompt Caching ROI Calculator |
| `/tools/context-window` | `ContextWindowComponent` | Context Window Comparator |
| `/tools/batch-api` | `BatchApiComponent` | Batch API Cost Calculator |
| `/insights` | `InsightsComponent` | "The Reddit Report" |
| `/verify` | `VerifyComponent` | Double opt-in email verification |
| `/unsubscribe` | `UnsubscribeComponent` | One-click unsubscribe da digest email |
| `/` | redirect -> `/tools/chatbot-simulator` | |

### Core Calculator (Chatbot Simulator)

| File | Responsabilita' |
| --- | --- |
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.ts` | Signals, computed, handlers, PDF export |
| `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` | Template con model cards, winner card, routing simulator |
| `src/app/engines/chatbot-simulator/logic.service.ts` | ValueScore, cost formulas, SimulatorResult, LlmModel, ModelPricing interfaces |

### Micro-Tool: Prompt Caching ROI (`/tools/caching-roi`)

| File | Responsabilita' |
| --- | --- |
| `src/app/engines/caching-roi/caching-roi-logic.service.ts` | Write/Read split, break-even, annual savings, cache discount |
| `src/app/engines/caching-roi/caching-roi.component.ts` | Signals, model selector, JSON-LD, dynamic meta |
| `src/app/engines/caching-roi/caching-roi.component.html` | 3/5+2/5 layout, sticky results, cost comparison bars |

### Micro-Tool: Context Window Comparator (`/tools/context-window`)

| File | Responsabilita' |
| --- | --- |
| `src/app/engines/context-window/context-window-logic.service.ts` | Token normalization (words/pages), per-model analysis, sort by price/size |
| `src/app/engines/context-window/context-window.component.ts` | Signals, bar width helpers, formatTokens, JSON-LD |
| `src/app/engines/context-window/context-window.component.html` | Sticky input bar, horizontal bar chart (green/red), unit+sort toggles |

### Micro-Tool: Batch API Calculator (`/tools/batch-api`)

| File | Responsabilita' |
| --- | --- |
| `src/app/engines/batch-api/batch-api-logic.service.ts` | Real-time vs batch cost, savings, cost/record, trivial savings detection |
| `src/app/engines/batch-api/batch-api.component.ts` | Signals, model selector (batch-only), JSON-LD, dynamic meta |
| `src/app/engines/batch-api/batch-api.component.html` | 3/5+2/5 layout, Time vs Money trade-off, cost comparison bars |

### Core Services (`src/app/core/services/`)

| Service | Responsabilita' |
| --- | --- |
| `pricing-data.service.ts` | Carica `llm-pricing.json` con TransferState per SSR |
| `price-history.service.ts` | Carica `price-history.json`, calcola trend 30d |
| `price-alert.service.ts` | Client Supabase, subscribe/verify via Edge Functions |
| `analytics.service.ts` | Tracking anonimo con debounce 2s |
| `market-insights.service.ts` | Dati per /insights ("The Reddit Report") |
| `json-ld.service.ts` | Schema.org injection (SoftwareApplication, FAQPage) |

Barrel export: `src/app/core/services/index.ts`

### Price Alerts (Supabase + Cron)

| File | Responsabilita' |
| --- | --- |
| `supabase/migrations/001_price_alerts.sql` | Tabella `price_alerts` + RLS (deny anon, service role bypass) |
| `supabase/migrations/002_unsubscribe_token.sql` | Colonna `unsubscribe_token` + backfill |
| `supabase/functions/subscribe-to-alert/index.ts` | Email validation, rate limiting, upsert, invio email via Resend, genera `unsubscribe_token` |
| `supabase/functions/verify-token/index.ts` | Token lookup, expiry check, set verified=true |
| `supabase/functions/check-price-shifts/index.ts` | Riceve drops dal cron, query alert verificati, raggruppa per email, invia digest HTML via Resend |
| `supabase/functions/unsubscribe/index.ts` | Riceve token, trova e elimina alert dal DB |
| `src/app/shared/components/price-alert-modal/price-alert-modal.component.ts` | Modal UI (4 stati: idle/loading/success/error), honeypot, Escape key |
| `src/app/pages/verify/verify.component.ts` | Pagina /verify, SSR-guarded, 3 stati |
| `src/app/pages/unsubscribe/unsubscribe.component.ts` | Pagina /unsubscribe, SSR-guarded, 4 stati (loading/success/error/no-token) |

### Data Registry (`public/data/llm-pricing.json` v1.3.0)

- **16 modelli**, **7 provider** (OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral AI)
- Campi pricing: `input_1m`, `output_1m`, `cached_input_1m` (tutti), `batch_input_1m`, `batch_output_1m` (solo OpenAI + Anthropic = 8 modelli)
- Capabilities: `context_window` (32K-2M), `latency_index` (0-1)

### Altre directory importanti

| Path | Contenuto |
| --- | --- |
| `public/data/price-history.json` | Snapshots storici settimanali (data moat) |
| `.github/workflows/price-snapshot.yml` | Cron domenicale: price snapshot + drop detection (>= 5%) + chiama check-price-shifts Edge Function |
| `src/app/core/constants/engine-weights.ts` | `VALUESCORE_ALPHA=0.65`, `VALUESCORE_BETA=0.35`, metadata |
| `src/app/core/configs/seo-presets.ts` | 5 scenari SEO (Startup, Growth, Enterprise, RAG, Content Gen) |
| `src/app/core/models/market-insight.model.ts` | Segment classification (Startup/Scale-up/Enterprise) |
| `docs/specs/` | Spec di feature (01-08) |
| `thoughts/` | Memoria persistente: `research/`, `plans/`, `decisions/` |

---

## Convenzioni e Pattern

### Angular

- **Signals** per tutto lo state management (no RxJS subjects per UI state)
- **Standalone Components** (no NgModules)
- **OnPush** change detection su tutti i component
- **Lazy loading** via `loadComponent` nelle routes
- **TransferState** per SSR hydration (zero CLS)
- `isPlatformBrowser()` guard per qualsiasi accesso a `window`, `document`, `localStorage`
- **Inline template** per component piccoli (modal, verify), **templateUrl** per component grandi

### Pattern Micro-Tool (replicato 3 volte)

Ogni micro-tool segue lo stesso pattern:
1. **Logic Service** (`*-logic.service.ts`): Pure TS, zero Angular deps, deterministic calculations
2. **Component** (`*.component.ts`): Standalone, Signals, OnPush, JSON-LD, dynamic meta, PricingDataService
3. **Template** (`*.component.html`): Breadcrumb, 3/5+2/5 grid (o sticky bar), cross-links 3-col, footer, Price Alert modal
4. **Route**: Lazy-loaded in `app.routes.ts`
5. **Cross-links**: Ogni tool linka tutti gli altri in un grid 3 colonne

### Styling

- Tailwind CSS (utility-first)
- `.tabular-nums` per stabilita' visiva sui numeri
- `.ghost-fade` / `.ghost-updating` per transizioni fluide durante update
- `.stable-height` / `.winner-card-stable` per prevenzione CLS

### Supabase

- Client inizializzato lazy con `isPlatformBrowser()` guard
- **Service Role Key** solo nelle Edge Functions (mai nel client)
- **Anon Key** nel client Angular (RLS blocca tutto per anon)
- Rate limiting DB-based (50 req/5 min per unverified alerts)
- Token verifica: UUID concatenati, expiry 24h

### Dati

- **MAI hardcodare prezzi nel codice** - sempre da `llm-pricing.json`
- `ValueScore = (1/Cost)^0.65 * log10(Context)^0.35 * LatencyIndex` - **IMMUTABILE**
- Ogni calcolo deve essere deterministico e tracciabile

### Git

- Branch principale: `main`
- Conventional commits: `feat:`, `fix:`, `feat(P1):`, etc.
- Non pushare senza approvazione esplicita

---

## Feature Implementate

| Feature | Stato | Note |
| --- | --- | --- |
| TCO Calculator con ValueScore | Production | Core product |
| Confronto multi-modello (16 modelli) | Production | Dynamic filter UI (max 5) |
| Model Routing Simulator | Production | Blend primary/secondary |
| Quick PDF Export | Production | Zero friction, no email |
| Enterprise PDF (email-gated) | Production | jsPDF client-side |
| Sensitivity Analysis (2x/3x) | Production | Nel winner card |
| Price History + Weekly Snapshots | Beta | GitHub Actions cron |
| Market Insights (/insights) | Production | "The Reddit Report" |
| EU Trust Signals | Production | GDPR, No Tracking badges |
| SEO Presets (5 scenari) | Production | Programmatic SEO URLs |
| Anonymous Analytics | Production | Debounce 2s, no PII |
| Price Alerts | Production | Bell icon + Winner CTA + modal + Supabase + Resend |
| Verify Page (/verify) | Production | Double opt-in flow |
| Price Alert Cron (spec 08) | Production | Weekly drop detection >= 5%, digest emails via Resend, GH Actions |
| Unsubscribe Page (/unsubscribe) | Production | One-click unsubscribe con token dedicato, 4 stati UI |
| Prompt Caching ROI Calculator | Production | Write/Read split, break-even, annual savings |
| Context Window Comparator | Production | Green/Red bars, token/word/page conversion, sort by price/size |
| Batch API Cost Calculator | Production | Real-time vs Batch, Time vs Money trade-off, trivial savings warning |

### Bundle Size (Lazy Chunks)

| Tool | Bundle | Transfer |
| --- | --- | --- |
| Chatbot Simulator | 77 kB | 19 kB |
| Caching ROI | 18 kB | 5 kB |
| Context Window | 15 kB | 5 kB |
| Batch API | 18 kB | 5 kB |

---

## Spec di Riferimento

| Spec | Contenuto | Stato |
| --- | --- | --- |
| `docs/specs/01-chatbot-simulator.md` | Core TCO calculator | Implementata |
| `docs/specs/02-ux-polish.md` | UX improvements | Implementata |
| `docs/specs/04-price-alerts.md` | Price alerts (A+B+C) | A+B+C implementate |
| `docs/specs/05-prompt-caching.md` | Prompt Caching ROI | Implementata |
| `docs/specs/06-context-window.md` | Context Window Comparator | Implementata |
| `docs/specs/07-batch-api.md` | Batch API Calculator | Implementata |
| `docs/specs/08-price-alert-cron.md` | Price Alert Cron & Digest Emails | Implementata |

---

## Roadmap e Prossimi Step Candidati

### Fatto

- ~~P0: Email capture~~ (via Price Alerts)
- ~~P2: Price alert subscriptions~~ (bell icon, modal, double opt-in)
- ~~P3: Micro-tools (Caching ROI, Context Window, Batch API)~~ (3/3 complete, cross-linked)
- ~~P5: Automated Growth~~ (weekly cron, digest emails, unsubscribe flow - spec 08)

### Da fare (in ordine di priorita' suggerita)

1. **Blog post inaugurale** - "How We Calculate LLM TCO" (contenuto da ChatGPT, implementazione route da te)
2. **Model detail pages** - `/models/[id]` per programmatic SEO
3. **Saved scenarios** - localStorage, no backend
4. **Env vars produzione** - Configurare `SUPABASE_URL`, `SUPABASE_ANON_KEY` su Vercel, `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` su Supabase, GitHub secrets per cron
5. **Unit test** - ValueScore calculation, logic services per ogni micro-tool

### Tech Debt noto

- `environment.prod.ts` ha placeholder (`__SUPABASE_URL__`) - da configurare prima del deploy Price Alerts
- `/insights` ha dati demo hardcoded (dovrebbe essere computed da analytics reali)
- Nessun unit test
- Nessun E2E test
- Warning CommonJS su jsPDF (non bloccante)

---

## Quick Start per una nuova sessione

1. **Leggi** `CLAUDE.md` (caricato automaticamente - istruzioni operative e regole)
2. **Leggi** questo documento (stato corrente)
3. **Controlla** `thoughts/` per piani e decisioni recenti
4. **Chiedi** a Mattia qual e' il prossimo obiettivo
5. **Prima di codificare**: crea un piano in `thoughts/plans/` se la feature tocca 3+ file
6. **Dopo**: `ng build` per validare

---

_Documento generato da Claude Code. Ultimo aggiornamento: 2026-02-09._
