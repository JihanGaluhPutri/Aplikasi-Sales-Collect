-- =============================================================================
-- TB-63 / TB-64 - Status Update RPC (atomic) + immutable history
--
-- Perubahan status collection dilakukan melalui SATU fungsi database sehingga
-- `invoices.status` dan `invoice_status_history` tidak pernah setengah berhasil
-- (atomic). Tidak ada policy INSERT pada invoice_status_history: klien
-- (termasuk mobile app) TIDAK bisa menulis history secara langsung, sehingga
-- riwayat hanya tercipta dari perubahan status yang sah.
--
-- SECURITY DEFINER + pemeriksaan eksplisit:
--   * memakai helper can_access_invoice() -> admin ATAU sales pemilik invoice;
--   * RLS pada tabel tetap berlaku untuk semua operasi lain;
--   * transisi linear saja: belum_ditagih -> sudah_ditagih -> dibayar;
--   * actor (changed_by) selalu auth.uid(), tidak bisa dipalsukan;
--   * history immutable: tidak ada policy INSERT/UPDATE/DELETE untuk klien.
-- =============================================================================

create or replace function public.update_invoice_status(
  p_invoice_id uuid,
  p_new_status public.invoice_status
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

  update public.invoices
     set status = p_new_status
   where id = p_invoice_id
  returning * into v_updated;

  insert into public.invoice_status_history (invoice_id, old_status, new_status, changed_by)
  values (p_invoice_id, v_current.status, p_new_status, (select auth.uid()));

  return v_updated;
end;
$$;

comment on function public.update_invoice_status(uuid, public.invoice_status) is
  'TB-63: mengubah status invoice secara atomic beserta pencatatan history (TB-64). Hanya admin/sales pemilik.';

-- Eksekusi hanya untuk user login; anon tidak dapat memanggil RPC ini.
revoke execute on function public.update_invoice_status(uuid, public.invoice_status)
  from public, anon;
grant execute on function public.update_invoice_status(uuid, public.invoice_status)
  to authenticated;
