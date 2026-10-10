-- =============================================================================
-- TB-12 — Table: invoice_status_history
-- Mencatat setiap perubahan status invoice agar dapat ditelusuri.
--
-- ON DELETE:
--   invoice_id : cascade  -> history hanya milik invoice tersebut
--   changed_by : set null -> menghapus account tidak menghapus jejak perubahan
--
-- Catatan: baris history ditulis melalui database function/RPC (TB-63, PART 2)
-- agar perubahan `invoices.status` dan history selalu atomic.
-- =============================================================================

create table if not exists public.invoice_status_history (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  old_status  public.invoice_status,
  new_status  public.invoice_status not null,
  changed_by  uuid references public.profiles (id) on delete set null,
  changed_at  timestamptz not null default now()
);

comment on table public.invoice_status_history is 'Riwayat perubahan status invoice. Ditulis hanya melalui fungsi database (atomic).';
comment on column public.invoice_status_history.old_status is 'Status sebelum perubahan. Null untuk perubahan pertama.';
comment on column public.invoice_status_history.changed_by is 'profiles.id user yang mengubah status. Null jika account sudah dihapus.';
