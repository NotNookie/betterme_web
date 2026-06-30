alter table public.orders
  add column if not exists delivery_email_sent_at timestamptz,
  add column if not exists delivery_email_provider_id text,
  add column if not exists delivery_email_error text;
