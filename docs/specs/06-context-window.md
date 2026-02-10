# Feature Spec: LLM Context Window Visualizer (Micro-Tool)

## Obiettivo

Visualizzare in modo immediato quali modelli riescono a gestire un determinato input (es. "un libro da 300 pagine" o "50k token") e quali andrebbero in overflow.

## Target User

Data Scientist e Product Owner che lavorano con RAG o long-document processing.
**User Story**: "Ho un PDF legale da 70k token. Quali sono i modelli piu' economici che riescono a processarlo tutto in una volta?"

## Requisiti Funzionali

- RF-1: Input semplice "My Content Size". Unita' selezionabile: Tokens (default), Words (stima 1.3 tok/word), Pages (stima 500 words/page).
- RF-2: Lista modelli ordinabile per "Larghezza Contesto" (desc) o "Prezzo Input" (asc).
- RF-3: Visualizzazione a barre orizzontali.
  - **Verde**: Capacita' > Input Utente.
  - **Rosso**: Capacita' < Input Utente (Overflow).
- RF-4: Indicatore visivo della % di utilizzo del contesto (es. "70k/128k - 54% full").

## Input/Output

| Campo        | Tipo   | Default | Validazione          | Note                                                   |
| ------------ | ------ | ------- | -------------------- | ------------------------------------------------------ |
| Content Size | Number | 30,000  | Min 1                | Size dell'utente                                       |
| Unit         | Select | Tokens  | Tokens, Words, Pages | Fattore conversione: Words=1.33, Pages=665 (500\*1.33) |
| Sort By      | Select | Price   | Price, Size          | Default Price per trovare "cheapest valid"             |

## Logica di Calcolo

```typescript
// Dati dal registry
const Context_Limit = model.capabilities.context_window;

// Input Utente (normalizzato a token)
let User_Tokens = UserInput.size;
if (UserInput.unit === "words") User_Tokens *= 1.33;
if (UserInput.unit === "pages") User_Tokens *= 665;

// Stato Modello
const Is_Valid = Context_Limit >= User_Tokens;
const Usage_Percent = (User_Tokens / Context_Limit) * 100;
const Overflow_Amount = User_Tokens - Context_Limit;

// Sorting
// - 'Price': Ordina per pricing.input_1m ASC
// - 'Size': Ordina per Context_Limit DESC
```

## UI/UX

- **Mobile First**: Input sticky in alto (o bottom sheet). Lista scrollabile sotto.
- **Bar Chart**:
  - Ogni riga e' un modello.
  - La barra grigia rappresenta il `context_window` totale (normalizzato sul max del registry, es. 2M).
  - La barra sovrapposta (blu) rappresenta l'input utente.
  - Se input > context, la barra diventa rossa e mostra l'overflow.
- **Chip**: "Fits!" (Verde) o "Overflow" (Rosso) accanto al nome.
- **Prezzo**: Mostrare costo per processare _quell'input specifico_.
  - Es. "Input Cost: $0.14" (calcolato su 70k token).

## SEO Impact

- **Target Keywords**: "llm context window comparison", "gpt-4o context limit", "largest context window ai", "claude vs gpt4 context".
- **Search Intent**: Informational / Comparison.
- **Page Title**: `LLM Context Window Comparator - GPT-4o, Claude 3 & Gemini Limits`
- **JSON-LD**: `Dataset` (elenco delle capabilities) + `SoftwareApplication`.

## Cross-Linking

- **Da Prompt Caching**: "Using huge context? Check if you can cache it [here]."
- **Verso Chatbot Simulator**: "Calculate full monthly TCO for this model."

## Edge Cases

- **EC-1**: Modelli con context infinito (non ne abbiamo ancora, ma Magic.dev sta arrivando).
- **EC-2**: Input utente > 2M (Max attuale). -> Tutti rossi. Messaggio "No model supports this size directly. Consider splitting/RAG."

## Criteri di Successo

- [ ] Visualizzazione chiara Green/Red.
- [ ] Conversione Words/Pages corretta e utile.
- [ ] Sorting funziona istantaneamente.
- [ ] Performance 100/100 Lighthouse (pagina molto leggera).
