-- =============================================================================
-- TB-07 — Database Enum
-- Nilai enum harus selalu sama dengan TypeScript types di types/user.ts
-- dan types/invoice.ts.
-- =============================================================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('admin', 'sales');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'invoice_status'
      and n.nspname = 'public'
  ) then
    create type public.invoice_status
      as enum ('belum_ditagih', 'sudah_ditagih', 'dibayar');
  end if;
end $$;

comment on type public.user_role is 'Role pengguna aplikasi: admin atau sales.';
comment on type public.invoice_status is 'Status collection invoice: belum_ditagih, sudah_ditagih, dibayar.';
