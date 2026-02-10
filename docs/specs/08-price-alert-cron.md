# Feature Spec: Price Alerts Cron Job (Automation)

## Obiettivo

Automatizzare il monitoraggio settimanale dei prezzi e l'invio delle notifiche via email agli utenti iscritti, trasformando la feature "Price Alerts" da statica a dinamica.

## Target User

Utenti che si sono iscritti agli aggiornamenti di prezzo per specifici modelli (o per tutti).
**User Story**: "Voglio ricevere una mail lunedì mattina se il prezzo di GPT-4o scende, senza dover controllare il sito ogni giorno."

## Requisiti Funzionali

- RF-1: **Cron Schedule**: Esecuzione ogni Lunedì alle 09:00 UTC.
- RF-2: **Change Detection**: Confrontare il `llm-pricing.json` live con lo snapshot della settimana precedente.
- RF-3: **Threshold Logic**: Notificare solo se il prezzo scende di almeno il **5%** (per evitare spam su micro-fluttuazioni valutarie).
- RF-4: **Batch Sending**: Usare Resend API per inviare le mail in batch (evitare loop 1-to-1 se possibile, o gestire rate limits).
- RF-5: **Unsubscribe**: Link diretto per cancellarsi (gestito da una nuova Edge Function `unsubscribe` o link statico con token).

## Architettura Tecnica

### Componenti

1.  **Supabase Edge Function**: `check-price-shifts`
2.  **Database**: Table `price_alerts` (già esistente)
3.  **Email Provider**: Resend (API)
4.  **Scheduler**: GitHub Actions (preferito per costi/semplicità) O Supabase pg_cron.

### Flusso Logico (`check-price-shifts`)

```typescript
// 1. Fetch Data
const currentPrices = await fetch('https://llm-cost-engine.com/data/llm-pricing.json');
const lastSnapshot = await fetch('https://raw.githubusercontent.com/.../history/latest.json');

// 2. Detect Drops
const drops = [];
for (const model of currentPrices.models) {
  const oldPrice = lastSnapshot.models.find(m => m.id === model.id)?.pricing.input_1m;
  const newPrice = model.pricing.input_1m;

  if (oldPrice && newPrice < oldPrice * 0.95) { // 5% drop
    drops.push({ modelId: model.id, old: oldPrice, new: newPrice, percent: ... });
  }
}

// 3. Select Users
if (drops.length > 0) {
  const affectedModelIds = drops.map(d => d.modelId);
  // Select users subscribed to ANY of the affected models OR 'all'
  const { data: alerts } = supabase
    .from('price_alerts')
    .select('email, model_id')
    .in('model_id', affectedModelIds)
    .eq('verified', true); // Solo utenti verificati!

  // 4. Send Emails (Resend)
  // Group by Email to send 1 single digest? Or 1 mail per alert?
  // Strategy: 1 Digest per user.
  const digests = groupByEmail(alerts, drops);

  for (const digest of digests) {
    await resend.emails.send({
      from: 'LLM Cost Engine <alerts@llm-cost-engine.com>',
      to: digest.email,
      subject: `Price Drop Alert: ${digest.models.join(', ')}`,
      html: renderEmailTemplate(digest)
    });
  }
}
```

## Input/Output (Funzione)

- **Trigger**: HTTP Request (con `Authorization: Bearer SERVICE_ROLE_KEY`) da GitHub Actions o Cron esterno.
- **Output**: JSON Log `{ drops_detected: 2, emails_sent: 150, errors: 0 }`.

## Edge Cases

- **EC-1**: Nessun calo di prezzo. -> Logga "No shifts" e esce.
- **EC-2**: Servizio Resend down/rate limited. -> Implementare retry logic o loggare l'errore per riprovare manualmente.
- **EC-3**: Utente iscritto a 5 modelli che droppano tutti. -> Inviare **una sola mail riepilogativa** (Digest), non 5 mail.

## Security

- La funzione deve verificare l'header `Authorization` per assicurarsi che sia chiamata solo dal Cron Job autorizzato (Service Role).
- RLS su tabella `price_alerts`: la funzione usa la Service Role Key per fare SELECT di tutte le mail (bypass RLS che normalmente limita all'owner).

## Criteri di Successo

- [ ] La funzione rileva correttamente un calo finto (test con JSON locale).
- [ ] Le mail vengono raggruppate (Digest).
- [ ] Il link "Unsubscribe" funziona (o porta a una pagina che permette di gestire le preferenze).
