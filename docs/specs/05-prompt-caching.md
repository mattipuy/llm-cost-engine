# Feature Spec: Prompt Caching ROI Calculator (Micro-Tool)

## Obiettivo

Creare un calcolatore dedicato per stimare il risparmio ottenuto abilitando il "Prompt Caching" (disponibile su Anthropic, Gemini, DeepSeek, OpenAI) rispetto alle chiamate standard.

## Target User

Sviluppatori e Team Lead che devono giustificare l'effort di implementazione del caching o capire il break-even point.
**User Story**: "Il mio system prompt e' di 5k token. Se faccio 100 richieste al giorno, quanto risparmio al mese abilitando la cache?"

## Requisiti Funzionali

- RF-1: Input per dimensione del "Static Content" (System Prompt + Knowledge Base).
- RF-2: Input per dimensione del "Dynamic Content" (User Query).
- RF-3: Input per volume chiamate (Daily/Monthly).
- RF-4: Input per "Cache Hit Rate" (Default: 90% - scenario ottimistico ma realistico per RAG/Agenti).
- RF-5: Output con confronto visivo: Costo Mensile Standard vs Costo Mensile Cached.
- RF-6: Output "Monthly Savings" in $ e %.

## Input/Output

| Campo                     | Tipo    | Default           | Validazione | Note                                                       |
| ------------------------- | ------- | ----------------- | ----------- | ---------------------------------------------------------- |
| Model                     | Select  | Claude 3.5 Sonnet | Required    | Filtra solo modelli con `cached_input_1m` > 0              |
| Static Tokens (Cacheable) | Number  | 5,000             | Min 1024    | La cache ha spesso un min size (es. 1024 su Anthropic)     |
| Dynamic Tokens (User)     | Number  | 100               | Min 1       | Parte non cachata                                          |
| Output Tokens             | Number  | 200               | Min 1       | Output non e' mai cachato                                  |
| Requests / Day            | Number  | 1,000             | Min 1       | Volume                                                     |
| Cache Write Freq (%)      | Percent | 10%               | 0-100       | Quante volte la cache scade/va riscritta (100% - Hit Rate) |

## Logica di Calcolo

Il calcolo deve distinguere tra **Cache Write** (First Call / TTL expire) e **Cache Read** (Hit).

```typescript
// Dati dal registry
const P_input = model.pricing.input_1m / 1_000_000;
const P_cached = model.pricing.cached_input_1m / 1_000_000;
const P_output = model.pricing.output_1m / 1_000_000;

// Input Utente
const Vol_Monthly = RequestsPerDay * 30;
const Static_Tok = UserInput.static;
const Dynamic_Tok = UserInput.dynamic;
const Output_Tok = UserInput.output;
const Write_Rate = UserInput.cacheWritePercent / 100; // es. 10% = 0.1
const Read_Rate = 1 - Write_Rate; // es. 90% = 0.9

// 1. Costo Standard (No Cache)
const Cost_NoCache = Vol_Monthly * ((Static_Tok + Dynamic_Tok) * P_input + Output_Tok * P_output);

// 2. Costo con Cache
// - Parte Statica: (Writes * P_input) + (Reads * P_cached)
const Cost_Static_Write = Vol_Monthly * Write_Rate * (Static_Tok * P_input);
const Cost_Static_Read = Vol_Monthly * Read_Rate * (Static_Tok * P_cached);
// - Parte Dinamica: Sempre P_input
const Cost_Dynamic = Vol_Monthly * (Dynamic_Tok * P_input);
// - Output: Sempre P_output
const Cost_Output = Vol_Monthly * (Output_Tok * P_output);

const Cost_Cached = Cost_Static_Write + Cost_Static_Read + Cost_Dynamic + Cost_Output;

// 3. Risultati
const Monthly_Savings = Cost_NoCache - Cost_Cached;
const Savings_Percent = (Monthly_Savings / Cost_NoCache) * 100;
```

## UI/UX

- **Layout**: Single Card centrata (max-width 3xl).
- **Left Column**: Form input (Slider + Number input).
- **Right Column** (Sticky): Big Number "Potential Savings".
- **Visual**: Bar chart orProgress bar "Standard vs Cached".
- **CTA**: "Track this model" (Price Alert Bell).

## SEO Impact

- **Target Keywords**: "prompt caching calculator", "anthropic cache pricing", "gemini context caching cost", "llm cache roi".
- **Search Intent**: Commercial / Transactional.
- **Page Title**: `Prompt Caching ROI Calculator - Estimate Savings for Claude & Gemini`
- **JSON-LD**: `SoftwareApplication` (ApplicationCategory: "UtilityApplication").

## Cross-Linking

- **Da Chatbot Simulator**: "Using a large system prompt? Check our [Cache ROI Calculator]."
- **Verso Context Window**: "Need a bigger context? Compare [Model Context Windows]."

## Edge Cases

- **EC-1**: Modello senza cache price nel JSON. -> Nascondere dal selector o mostrare "Not Supported".
- **EC-2**: Static Tokens < Minimum (es. <1024). -> Mostrare warning "Minimum cacheable size for Antoine is 1024 tokens".

## Criteri di Successo

- [ ] Select mostra solo modelli `cached_input_1m` definito.
- [ ] Calcolo corrisponde alla logica Write/Read split.
- [ ] Mobile-responsive senza scroll orizzontale.
- [ ] Meta tags dinamici basati sul modello selezionato.
