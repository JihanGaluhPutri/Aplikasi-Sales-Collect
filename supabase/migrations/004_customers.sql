-- =============================================================================
-- TB-10 — Table: customers
-- Satu customer dapat memiliki banyak invoice.
-- =============================================================================

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_name  text,
  phone       text,
  address     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.customers is 'Data customer. Hanya wajib mengisi name; field lain opsional.';

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();
