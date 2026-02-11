-- Add unsubscribe token for secure email unsubscribe links
ALTER TABLE public.price_alerts ADD COLUMN IF NOT EXISTS unsubscribe_token text;

-- Backfill existing rows with random tokens
UPDATE public.price_alerts
SET unsubscribe_token = replace(gen_random_uuid()::text, '-', '')
WHERE unsubscribe_token IS NULL;
