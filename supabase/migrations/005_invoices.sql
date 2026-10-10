-- =============================================================================
-- TB-11 — Table: invoices
--
-- Relasi:
--   invoices.customer_id -> customers.id   (wajib)
--   invoices.sales_id    -> sales.id        (nullable, diisi saat assignment)
--
-- ON DELETE:
--   customer_id : restrict -> customer yang masih punya invoice tidak boleh dihapus
--   sales_id    : restrict -> invoice tidak kehilangan pemilik tanggung jawab
--                 (menonaktifkan sales dilakukan lewat is_active, bukan delete)
-- =============================================================================

create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text not null,
  customer_id     uuid not null references public.customers (id) on delete restrict,
  sales_id        uuid references public.sales (id) on delete restrict,
  amount          numeric(18, 2) not null,
  invoice_date    date not null,
  due_date        date not null,
  status          public.invoice_status not null default 'belum_ditagih',
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.invoices is 'Seluruh tagihan customer. Status default belum_ditagih.';
comment on column public.invoices.sales_id is 'Sales yang bertanggung jawab. Null berarti invoice belum ditugaskan.';
comment on column public.invoices.status is 'Status collection: belum_ditagih, sudah_ditagih, dibayar.';

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row
  execute function public.set_updated_at();
