-- =============================================================================
-- TB-08 — Table: profiles
-- Menyimpan informasi user aplikasi SELAIN credential authentication.
-- Password, token, dan secret TIDAK pernah disimpan di tabel ini.
-- =============================================================================

-- Fungsi bantu untuk menjaga updated_at tetap akurat.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Trigger function: mengisi updated_at dengan waktu sekarang.';

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null,
  role        public.user_role not null default 'sales',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Profil user aplikasi, terhubung dengan auth.users. Tidak menyimpan password.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
