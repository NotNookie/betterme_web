create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  product_id text not null,
  product_title text not null,
  customer_email text not null,
  amount integer not null,
  currency text not null default 'PHP',
  status text not null default 'pending',
  access_token_hash text,
  paymongo_checkout_session_id text,
  download_url text,
  delivery_email_sent_at timestamptz,
  delivery_email_provider_id text,
  delivery_email_error text,
  paymongo_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_reference_number_idx on public.orders (reference_number);
create index if not exists orders_customer_email_idx on public.orders (customer_email);

alter table public.orders enable row level security;

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create index if not exists webhook_events_event_type_idx on public.webhook_events (event_type);

alter table public.webhook_events enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'orders_set_updated_at'
  ) then
    create trigger orders_set_updated_at
    before update on public.orders
    for each row
    execute function public.set_updated_at();
  end if;
end;
$$;
