# Feature Spec: Batch API Cost Calculator (Micro-Tool)

## Obiettivo

Stimare il risparmio ottenuto utilizzando le "Batch API" (asincrone, ~24h turnaround) offerte da OpenAI e Anthropic rispetto alle chiamate real-time standard.

## Target User

Data Engineer e Backend Developer interessati a migrare job non urgenti (es. content moderation, classificazione notturna) per dimezzare i costi.
**User Story**: "Ho 1 milione di recensioni da classificare. Non mi serve real-time. Quanto risparmio con le Batch API?"

## Requisiti Funzionali

- RF-1: Input per volume job (es. "1M records" con size media).
- RF-2: Calcolo del costo "Standard" vs "Batch".
- RF-3: Visualizzazione del tempo stimato di completamento (default: "Within 24h").
- RF-4: Supporto solo per provider che hanno Batch API (OpenAI: 50%, Anthropic: 50%, Google: N/A al momento del check).

## Input/Output

| Campo             | Tipo   | Default | Validazione | Note                                     |
| ----------------- | ------ | ------- | ----------- | ---------------------------------------- |
| Model             | Select | GPT-4o  | Required    | Filtra solo modelli con `batch_input_1m` |
| Records           | Number | 10,000  | Min 1       | Numero di "chiamate"                     |
| Avg Input Tokens  | Number | 500     | Min 1       | Size per record                          |
| Avg Output Tokens | Number | 100     | Min 1       | Size per record                          |

## Logica di Calcolo

**Dati mancanti nel registry attuale**.
E' necessario prima aggiornare `llm-pricing.json` aggiungendo:

```json
"pricing": {
  "batch_input_1m": 1.25, // 50% discount per GPT-4o
  "batch_output_1m": 5.00
}
```

Formula:

```typescript
const Total_Input = UserInput.records * UserInput.avgInput;
const Total_Output = UserInput.records * UserInput.avgOutput;

const Cost_RealTime = Total_Input * P_input + Total_Output * P_output;
const Cost_Batch = Total_Input * P_batch_input + Total_Output * P_batch_output;

const Savings = Cost_RealTime - Cost_Batch;
```

## UI/UX

- **Card Layout**: Simile al Prompt Caching Calculator.
- **Visual**: "Time vs Money" trade-off.
  - Asse Y: Costo. Asse X: Tempo (Real-time: ms, Batch: 24h).
  - Mostrare chiaramente che il risparmio "costa tempo" (24h).
- **Tabella Confronto**:
  - Riga 1: Real-Time API | $100 | Instant
  - Riga 2: Batch API | $50 | 24 Hours

## SEO Impact

- **Target Keywords**: "openai batch api pricing", "anthropic batch vs real-time cost", "llm batch processing calculator".
- **Search Intent**: Commercial (Cost savings).
- **Page Title**: `Batch API Cost Calculator - 50% Savings on GPT-4o & Claude`
- **JSON-LD**: `SoftwareApplication`.

## Cross-Linking

- **Da Chatbot Simulator**: "Processing overnight? Calculate [Batch API Savings]."

## Edge Cases

- **EC-1**: Modelli senza batch pricing (Google, DeepSeek). -> Nascondere dal selector.
- **EC-2**: Volumi piccoli dove il saving e' irrilevante. -> Mostrare "Batch API is optimized for high volume. Your saving is < $0.01".

## Criteri di Successo

- [ ] Aggiornamento `llm-pricing.json` (Prerequisito).
- [ ] Calculator supporta OpenAI e Anthropic (principali provider batch).
- [ ] UX mette in evidenza il trade-off 24h.
