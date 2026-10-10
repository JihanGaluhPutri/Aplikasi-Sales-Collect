-- =============================================================================
-- 014 — Payment Proof via Status Update RPC
--
-- Mengganti fungsi update_invoice_status (migration 011) dengan versi yang
-- menerima parameter OPSIONAL p_payment_proof_path:
--
--   * Transisi ke `dibayar` menyimpan path bukti pembayaran dalam transaksi
--     yang sama dengan perubahan status + history (atomic).
--   * Pemanggilan lama dengan 2 argumen tetap valid (argumen ke-3 punya
--     default NULL) sehingga tidak merusak pemanggilan/pengujian yang ada.
--   * p_payment_proof_path NULL -> path lama TIDAK dihapus (coalesce).
--   * Aplikasi WAJIB mengunggah foto ke storage SEBELUM memanggil RPC ini
--     (upload gagal -> status tidak berubah); pemeriksaan wajib bukti untuk
--     transisi ke dibayar dilakukan di service layer aplikasi.
--   * Tidak ada perubahan pada aturan transisi linear maupun otorisasi
--     (can_access_invoice).
--
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor.
-- =============================================================================

drop function if exists public.update_invoice_status(uuid, public.invoice_status);

create or replace function public.update_invoice_status(
  p_invoice_id uuid,
  p_new_status public.invoice_status,
  p_payment_proof_path text default null
)
returns public.invoices
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_current public.invoices;
  v_updated public.invoices;
begin
  -- Authorization: admin ATAU sales pemilik invoice (sumber kebenaran sama
  -- dengan policy RLS di migration 009).
  if not public.can_access_invoice(p_invoice_id) then
    raise exception 'Invoice tidak ditemukan atau Anda tidak berwenang.'
      using errcode = '42501';
  end if;

  select * into v_current from public.invoices where id = p_invoice_id;

  if not found then
    raise exception 'Invoice tidak ditemukan atau Anda tidak berwenang.'
      using errcode = '42501';
  end if;

  if not (
    (v_current.status = 'belum_ditagih' and p_new_status = 'sudah_ditagih')
    or (v_current.status = 'sudah_ditagih' and p_new_status = 'dibayar')
  ) then
    raise exception 'Transisi status harus linear: belum_ditagih -> sudah_ditagih -> dibayar.'
      using errcode = '23514';
  end if;

  -- p_payment_proof_path diisi hanya saat transisi ke dibayar; jika NULL,
  -- path lama dipertahankan (coalesce).
  update public.invoices
     set status = p_new_status,
         payment_proof_path = coalesce(p_payment_proof_path, payment_proof_path)
   where id = p_invoice_id
  returning * into v_updated;

  insert into public.invoice_status_history (invoice_id, old_status, new_status, changed_by)
  values (p_invoice_id, v_current.status, p_new_status, (select auth.uid()));

  return v_updated;
end;
$$;

comment on function public.update_invoice_status(uuid, public.invoice_status, text) is
  'TB-63: mengubah status invoice secara atomic beserta history (TB-64) dan penyimpanan bukti pembayaran (payment_proof_path). Hanya admin/sales pemilik.';

-- Eksekusi hanya untuk user login; anon tidak dapat memanggil RPC ini.
revoke execute on function public.update_invoice_status(uuid, public.invoice_status, text)
  from public, anon;
grant execute on function public.update_invoice_status(uuid, public.invoice_status, text)
  to authenticated;
