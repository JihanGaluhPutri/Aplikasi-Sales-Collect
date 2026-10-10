-- =============================================================================
-- TB-09 — Table: sales
-- Data sales yang dapat menerima assignment invoice.
-- user_id menghubungkan record sales dengan account login (jika ada).
-- =============================================================================

create table if not exists public.sales (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  name        text not null,
  phone       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.sales is 'Data sales. sales.user_id terhubung ke profiles.id (account login sales).';
comment on column public.sales.user_id is 'Account login sales. Null jika sales belum memiliki account.';
comment on column public.sales.is_active is 'Sales nonaktif tidak menerima assignment invoice baru, data historis tetap ada.';

drop trigger if exists sales_set_updated_at on public.sales;
create trigger sales_set_updated_at
  before update on public.sales
  for each row
  execute function public.set_updated_at();
