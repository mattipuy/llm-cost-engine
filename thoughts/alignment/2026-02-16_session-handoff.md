# Session Handoff: LLM Cost Engine - Allineamento Strategico

**Data**: 2026-02-16
**Versione Progetto**: Registry v2.0.0 (post-cleanup)
**Status Build**: ✅ Passing
**Ultimo Deploy**: Main branch (commit fafdad0)

---

## 🎯 OBIETTIVO PRIMARIO: SECONDA ENTRATA MENSILE

**Vision**: Creare una **rendita automatica B2B** attraverso autorità neutrale nel pricing LLM.

### Modello di Business Target
- **Fase 1 (Attuale)**: Autorità Neutrale → Traffic Organico → Data Moat
- **Fase 2 (Q2 2026)**: Sponsorship B2B Invisibile (no affiliate aggressivi)
- **Fase 3 (Q3 2026)**: API Premium + Enterprise Insights

### Metriche di Successo
- [ ] 10K visite/mese organiche (attuale: ~2K stimato)
- [ ] 500+ email raccolte per price alerts (attuale: 0, feature implementata ma non attiva)
- [ ] $500-1000/mese da sponsor B2B discreti (attuale: $0)

---

## 📊 STATO DELL'ARTE (Feb 2026)

### ✅ Completato nelle ultime 48h

#### **1. Full Audit & Fix di TUTTI i 4 Tool (40 issue risolte)**
- **Context-Window**: 11 fix, 3 commits (db737fb, a1e602f, 9e0d29b)
- **Batch-API**: 8 fix, 3 commits (db3ec0f, af88969, 957c5c4)
- **Caching-ROI**: 7 fix, 3 commits (ffe9a70, c9484da, b0ba86d)
- **Chatbot-Simulator**: 11 fix, 3 commits (edb1ac0, 11e6d51, f6839f3)

**Pattern fixes applicati ovunque**:
- ✅ Memory leak protection (destroy$ Subject + takeUntil)
- ✅ Error recovery con retry (isRetrying signal)
- ✅ Form reset (DEFAULT_VALUES + Reset button)
- ✅ ARIA accessibility (16 sliders totali con aria-valuemin/max/now)
- ✅ ESC key modal support
- ✅ Touch targets WCAG 2.1 AA (12+ buttons upgraded)
- ✅ Sticky sidebar responsive (xl:sticky xl:top-8)

#### **2. Registry Cleanup (v2.0.0 Major Release)**
Commit 694b6cd - Rimossi 10 modelli obsoleti:
- text-davinci-003, code-davinci-002 (OpenAI legacy)
- claude-instant-1.2, claude-2.0, claude-2.1 (Anthropic old)
- gemini-pro (Google superseded)
- gpt-4-32k, gpt-4-1106-preview (OpenAI deprecated)
- llama-2-70b, mistral-medium (Provider deprecated)

Aggiunti: GPT-5-series placeholders (future-proofing)

#### **3. Build & CI Fixes**
- ✅ TypeScript: Rimosso `as const` da DEFAULT_VALUES (commit ddd3fbd)
- ✅ GitHub Actions: Fixed `setup_node` → `setup-node` (commit fafdad0)
- ✅ Weekly Price Snapshot workflow ora funzionante

---

## 🏗️ ARCHITETTURA ATTUALE

### Stack Tecnico
- **Frontend**: Angular 19, Signals, SSR, Tailwind CSS
- **Data Layer**: JSON registries (`public/data/llm-pricing.json`, `price-history.json`)
- **Backend**: Supabase (price alerts, email subscriptions)
- **Deploy**: Vercel (produzione)
- **CI/CD**: GitHub Actions (weekly snapshots, deploy)

### File Critici
```
public/data/
├── llm-pricing.json          # Registry v2.0.0 (15 modelli attivi)
└── price-history.json        # Snapshots settimanali (Data Moat)

src/app/engines/
├── chatbot-simulator/        # Tool principale (full TCO)
├── context-window/           # Comparatore context limits
├── batch-api/                # ROI batch vs real-time
└── caching-roi/              # ROI prompt caching

.github/workflows/
├── price-snapshot.yml        # Weekly pricing updates (Domenica 00:00 UTC)
└── deploy-supabase-functions.yml

scripts/
├── update-pricing-procedure.md   # Procedura 6-fasi per update prezzi
├── pricing-sources.json          # URL ufficiali OpenAI/Anthropic/Google
└── pricing-update-template.md    # Template changelog
```

### Data Moat Status
- **Snapshots Storici**: ~12 settimane di dati (Q4 2025 - Q1 2026)
- **Frequency**: Weekly automated snapshots (ogni domenica)
- **Coverage**: 15 modelli attivi, 5 provider (OpenAI, Anthropic, Google, DeepSeek, Mistral)
- **Trend Detection**: Automatico via `price-history.service.ts`

---

## 🚀 PROSSIMI STEP PRIORITIZZATI

### **PRIORITY 1: Monetizzazione Invisibile (Q2 2026)**

#### A. Sponsorship B2B Discreto
**Goal**: $500-1000/mese senza rovinare Trust neutrale

**Implementazione**:
1. **Footer "Powered By" Badge** (NON intrusivo)
   - Target: Vercel, Supabase, Anthropic (tool users)
   - Format: "Powered by Vercel · Built with Anthropic Claude"
   - Revenue: $200-500/sponsor/mese (3-4 sponsor totali)

2. **"Featured Provider" Highlight** (sottile)
   - Badge dorato "Featured" su 1 provider nel comparatore
   - Rotazione mensile tra provider disposti a pagare
   - Revenue: $500/mese per slot

3. **Enterprise Export Sponsorship**
   - PDF firmato include "Analysis powered by [Sponsor]"
   - Non cambia ranking, solo branding discreto
   - Revenue: $300/mese

**File da modificare**:
- `src/app/engines/chatbot-simulator/chatbot-simulator.component.html` (footer badge)
- `src/app/engines/chatbot-simulator/logic.service.ts` (featured flag)
- `src/app/core/services/pdf-generator.service.ts` (sponsor in PDF)

**Trade-off da rispettare**:
- ❌ NO affiliate links aggressivi
- ❌ NO "Recommended" badge che altera ranking
- ✅ SI branding discreto in footer/PDF
- ✅ SI highlight visivo che NON cambia ValueScore

---

#### B. Email Collection & Price Alerts (Growth Engine)
**Goal**: 500+ subscriber entro Q2 2026

**Attuale**:
- ✅ Modal implementato (`price-alert-modal.component.ts`)
- ✅ Supabase backend ready
- ❌ NON attivato in produzione (manca email sender)

**Next Actions**:
1. **Attivare Supabase Edge Function `send-price-alert`**
   - File: `supabase/functions/send-price-alert/index.ts`
   - Provider: Resend.com (free tier: 3K email/mese)
   - Template: "GPT-4o dropped 20% - New: $2.50/1M tokens"

2. **A/B Test CTA Positioning**
   - Variant A: Bell icon in model selector (attuale)
   - Variant B: Banner in-page "Track price drops"
   - Metric: Conversion rate signup

3. **First-Drop Email Flow**
   - Welcome email con value prop
   - Primo alert entro 7 giorni (use historical drops)
   - Upsell: "Premium: Real-time alerts" (futuro)

**Revenue Potential**:
- 500 subscriber × $0 (free tier) = Lead gen per sponsor
- Sponsor value: "$1-2 per qualified B2B lead" = $500-1000/mese extra

---

### **PRIORITY 2: SEO & Traffic Growth**

#### A. Content Marketing (Programmatic SEO)
**Goal**: 10K visite/mese organiche

**Low-Hanging Fruit**:
1. **Landing Pages per Modello** (`/models/gpt-4o`, `/models/claude-3.5-sonnet`)
   - Auto-generate da registry JSON
   - Schema.org Product markup
   - Comparison tables embedded
   - ETA: 2 giorni dev

2. **Use Case Pages** (`/use-cases/saas-chatbot`, `/use-cases/enterprise-rag`)
   - Preset configurations linkabili
   - ROI examples real-world
   - ETA: 3 giorni dev

3. **Provider Comparison Pages** (`/compare/openai-vs-anthropic`)
   - Neutral head-to-head
   - Price history charts
   - ETA: 2 giorni dev

**SEO Patterns da Seguire**:
- File: `src/app/core/services/json-ld.service.ts` (già implementato)
- Pattern: SoftwareApplication schema per ogni tool
- Meta tags dinamici già in place (`updateDynamicMeta()`)

---

#### B. Backlink Strategy (Autorità)
**Goal**: DR 30+ su Ahrefs entro Q3 2026

**Azioni**:
1. **Guest Post su Blog B2B**
   - Target: Dev.to, Hacker Noon, Medium publications
   - Topic: "How we saved $5K/month switching from GPT-4 to Claude 3.5"
   - Link back: Tool + pricing data

2. **Open Source Registry API**
   - Esporre `llm-pricing.json` via API pubblica
   - README su GitHub con badge "Pricing data by LLM Cost Engine"
   - Target: Altri tool usano i nostri dati → backlink naturale

3. **Press Release su Major Drops**
   - "GPT-4o price drops 30% - Industry Analysis"
   - Distribuire via PRWeb quando detect drop >= 20%
   - Autopilot: GitHub Action trigger on significant drop

---

### **PRIORITY 3: Product Enhancements**

#### A. Routing Simulator Polish (Already 80% Done)
- [x] Toggle implemented (`routingEnabled` signal)
- [x] Same-model warning UI
- [ ] **TODO**: Add routing cost logic (model A → model B fallback)
- [ ] **TODO**: Multi-tier routing (GPT-4 → GPT-3.5 → Llama fallback)
- ETA: 4 ore

#### B. Sensitivity Analysis UX
- [x] Backend logic exists (`calculateSensitivity()`)
- [x] Shown in Enterprise PDF export
- [ ] **TODO**: Interactive sliders "What if volume 2x?" in UI
- [ ] **TODO**: Scenario comparison (pessimistic/optimistic)
- ETA: 6 ore

#### C. Multi-Currency Support
- [ ] EUR, GBP, JPY conversions
- [ ] Exchange rate API (free tier: exchangerate-api.com)
- [ ] LocalStorage preference
- ETA: 3 ore

---

## 📈 METRICHE DA TRACCIARE

### Growth Metrics (Settimanale)
- [ ] **Organic Traffic**: Google Analytics 4
- [ ] **Email Signups**: Supabase `price_alerts` table count
- [ ] **Tool Usage**: Event tracking (`analyticsService.trackToolUsage()`)
- [ ] **PDF Exports**: Count in `analyticsService`

### Business Metrics (Mensile)
- [ ] **MRR**: Monthly Recurring Revenue (target: $500 by Q2)
- [ ] **Lead Quality**: B2B email domains (vs gmail.com)
- [ ] **Sponsor Pipeline**: Outreach → Demo → Contract

### Technical Metrics (Continuous)
- [x] **Build Status**: GitHub Actions badge (passing ✅)
- [x] **Lighthouse Score**: 100/100 (già ottimizzato)
- [ ] **Uptime**: UptimeRobot (99.9% target)
- [ ] **Price Freshness**: Weekly snapshot success rate

---

## 🎓 LESSONS LEARNED

### Cosa ha Funzionato
1. **Pattern Reuse**: 80% copy/paste tra tools = massive efficiency
2. **Audit Sistematico**: Plan agent → 3 fasi → commit strutturati
3. **CLAUDE.md Governance**: Sub-agents allineati, no hallucinations
4. **Data-Driven**: JSON registry = single source of truth

### Cosa Evitare
1. **NO Over-Engineering**: Keep it simple (3 linee duplicate > abstraction prematura)
2. **NO Affiliate Aggressivi**: Rovina Trust B2B
3. **NO Features Senza Validazione**: Prima traffico, poi monetizzazione
4. **NO `as const` in Signal Defaults**: Crea literal types (TypeScript hell)

---

## 🔗 RISORSE CHIAVE

### Documentazione Interna
- **CLAUDE.md**: Governance, workflow, agent protocols
- **scripts/update-pricing-procedure.md**: 6-phase pricing update SOP
- **thoughts/decisions/**: Architectural trade-offs log

### External Dependencies
- **Pricing Sources**: `scripts/pricing-sources.json` (OpenAI, Anthropic URLs)
- **Supabase Dashboard**: https://supabase.com/dashboard (price alerts DB)
- **Vercel Deploy**: https://vercel.com/mattipuy/llm-cost-engine

### Key Contacts
- **User (Mattia)**: Product owner, B2B strategy
- **Claude Code**: Lead dev, implementation
- **Gemini 3 Pro**: Market research, content strategy (external)

---

## 🚦 DECISION GATES

### Prima di Aggiungere Feature
1. **Allinea con Business Goal**: Aumenta traffic o revenue?
2. **Consulta Market Researcher**: Utenti enterprise vogliono questo?
3. **Verifica Trend Analyst**: Mercato LLM sta andando in questa direzione?
4. **Plan → Iterate → Validate**: No code senza plan in `thoughts/plans/`

### Prima di Modificare Pricing Registry
1. **Leggi**: `scripts/update-pricing-procedure.md`
2. **Usa**: `multi-agent-coordinator` (competitive + trend + market analyst in parallelo)
3. **Valida**: 5 criteri per add, 6 trigger per remove
4. **Sources**: Verifica 2+ fonti ufficiali
5. **User Approval**: NEVER auto-update without explicit OK

### Prima di Deploy
1. **Build Passa**: `npm run build` (no errors)
2. **Type Check**: `npm run type-check` (opzionale ma consigliato)
3. **Git Status Clean**: No uncommitted changes
4. **Structured Commit**: Format in CLAUDE.md + Co-Authored-By

---

## 🎬 QUICK START (Prossima Sessione)

### Se Focus su **Monetizzazione**:
```bash
# 1. Implementa Footer Sponsor Badge
- File: src/app/engines/chatbot-simulator/chatbot-simulator.component.html
- Add: <div class="sponsor-badge">Powered by Vercel</div>

# 2. Attiva Price Alerts Email
- Setup: Resend.com account
- Deploy: supabase/functions/send-price-alert
- Test: Manual trigger con drop simulato
```

### Se Focus su **Traffic**:
```bash
# 1. Generate Model Landing Pages
- Task: fullstack-developer agent
- Pattern: /models/:modelId routing
- Schema: Product markup + meta tags

# 2. Publish Open Source API
- Endpoint: /api/pricing (public JSON)
- README: GitHub badge + usage examples
- Submit: ShowHN, ProductHunt
```

### Se Focus su **Polish**:
```bash
# 1. Complete Routing Simulator
- File: chatbot-simulator/logic.service.ts
- Add: routingCostCalculation() method
- Test: Multi-tier fallback scenarios

# 2. Interactive Sensitivity UI
- Component: sensitivity-slider.component.ts (new)
- Feature: "What if volume 2x?" live updates
```

---

## 📞 CONTACT & CONTINUITY

**Per Nuova Sessione**:
1. **Read This Doc First**: Allineamento completo in 5 min
2. **Check Git Log**: `git log --oneline -20` per capire ultimi commits
3. **Review thoughts/**: Decisioni e piani precedenti
4. **Ask User**: "Quale priorità oggi: Monetizzazione, Traffic o Polish?"

**Persistence Pattern**:
- Ogni research → `thoughts/research/[DATE]_topic.md`
- Ogni plan → `thoughts/plans/[DATE]_feature.md`
- Ogni decision → `thoughts/decisions/[DATE]_decision.md`

---

**🎯 Remember**: L'obiettivo NON è solo un bel tool, ma una **rendita automatica B2B**. Ogni feature deve rispondere: "Questo aumenta traffic organico o revenue sponsor?"

**Less is More**: 3 sponsor discreti a $500/mese > 50 affiliate a $10/mese (che rovinano Trust).

---

**Status**: ✅ Ready for Next Session
**Next Action**: User decides Priority 1, 2, or 3
**ETA to $500 MRR**: 6-8 settimane con focus Monetizzazione
