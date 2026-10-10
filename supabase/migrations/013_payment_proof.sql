-- =============================================================================
-- 013 — Payment Proof (upload bukti pembayaran)
--
-- Fitur enhancement pasca-MVP (lihat Product Backlog "COULD HAVE"):
-- Sales wajib mengunggah foto bukti pembayaran ketika menandai invoice
-- sebagai Dibayar. Aturan keamanan:
--
--   * Bucket PRIVATE `payment-proofs` (tidak pernah public).
--   * Struktur path: invoices/{invoice_id}/{nama_unik}.{ext}
--   * INSERT (upload) hanya oleh sales pemilik invoice tersebut - diverifikasi
--     ke tabel invoices+sales di dalam policy storage, bukan hanya di UI.
--   * SELECT: sales pemilik invoice ATAU admin.
--   * UPDATE/DELETE (replace/cleanup) hanya sales pemilik invoice.
--   * file_size_limit 5 MB + allowed_mime_types gambar.
--   * URL ditampilkan lewat signed URL (tidak pernah URL publik hardcoded).
--   * Aplikasi menyimpan path di invoices.payment_proof_path SETELAH upload
--     berhasil; status invoice tidak berubah jika upload gagal (lihat 014).
--
-- Jalankan SEKALI di Supabase Dashboard -> SQL Editor.
-- =============================================================================

-- Kolom baru: path bukti pembayaran (null = belum ada bukti).
alter table public.invoices
  add column if not exists payment_proof_path text;

comment on column public.invoices.payment_proof_path is
  'Path file bukti pembayaran di bucket private payment-proofs (invoices/{invoice_id}/file). Null = belum ada bukti.';

-- Bucket private.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5 MB, sejalan dengan batas validasi di aplikasi
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Policies: storage.objects untuk bucket payment-proofs
-- ---------------------------------------------------------------------------

-- SELECT: sales pemilik invoice terkait ATAU admin.
drop policy if exists payment_proof_select_owner_or_admin on storage.objects;
create policy payment_proof_select_owner_or_admin on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.invoices i
        join public.sales s on s.id = i.sales_id
        where (storage.foldername(storage.objects.name))[1] = 'invoices'
          and i.id::text = (storage.foldername(storage.objects.name))[2]
          and s.user_id = (select auth.uid())
      )
    )
  );

-- INSERT: hanya sales pemilik invoice pada path invoices/{invoice_id}/...
drop policy if exists payment_proof_insert_owner on storage.objects;
create policy payment_proof_insert_owner on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = 'invoices'
    and exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.id::text = (storage.foldername(storage.objects.name))[2]
        and s.user_id = (select auth.uid())
    )
  );

-- UPDATE: diperlukan untuk replace file (upsert) pada upload ulang.
drop policy if exists payment_proof_update_owner on storage.objects;
create policy payment_proof_update_owner on storage.objects
  for update to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = 'invoices'
    and exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.id::text = (storage.foldername(storage.objects.name))[2]
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = 'invoices'
    and exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.id::text = (storage.foldername(storage.objects.name))[2]
        and s.user_id = (select auth.uid())
    )
  );

-- DELETE: cleanup oleh aplikasi jika update status setelah upload gagal.
drop policy if exists payment_proof_delete_owner on storage.objects;
create policy payment_proof_delete_owner on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(storage.objects.name))[1] = 'invoices'
    and exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.id::text = (storage.foldername(storage.objects.name))[2]
        and s.user_id = (select auth.uid())
    )
  );
