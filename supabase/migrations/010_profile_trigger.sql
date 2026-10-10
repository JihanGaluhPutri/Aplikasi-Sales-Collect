-- =============================================================================
-- TB-36 - Profile Creation Trigger
--
-- Setiap user baru di auth.users otomatis mendapatkan baris di public.profiles.
-- Ini membuat aplikasi tidak pernah menemui "auth user tanpa profile".
--
-- Keamanan:
--   * fungsi SECURITY DEFINER (owner: postgres) sehingga trigger tetap berjalan
--     walau RLS aktif, sama seperti mekanisme trigger standar Supabase;
--   * role SELALU 'sales' - register publik tidak pernah bisa menentukan role;
--     role admin hanya dibuat lewat provisioning terkontrol oleh admin;
--   * nama diambil dari metadata register (raw_user_meta_data.name), fallback ke
--     bagian sebelum '@' pada email. Password TIDAK pernah disentuh/disisa di sini;
--   * ON CONFLICT DO NOTHING membuat fungsi idempotent (aman diulang).
-- =============================================================================

do $$
begin
  if to_regclass('auth.users') is null then
    raise exception 'Tabel auth.users tidak ditemukan. Jalankan migration ini di database Supabase.';
  end if;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');

  if v_name is null then
    v_name := nullif(split_part(coalesce(new.email, ''), '@', 1), '');
  end if;

  if v_name is null then
    v_name := 'Pengguna';
  end if;

  insert into public.profiles (id, name, role)
  values (new.id, v_name, 'sales')
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'TB-36: membuat profile default (role sales) ketika user baru dibuat di auth.users.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
