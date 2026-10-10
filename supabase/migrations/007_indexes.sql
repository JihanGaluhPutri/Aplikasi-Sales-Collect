-- =============================================================================
-- TB-14 — Database Index
-- Index dibuat untuk kolom yang dipakai pada filtering, searching,
-- relationship/ownership. Tidak membuat index di luar kebutuhan query utama.
-- =============================================================================

-- profiles: filter berdasarkan role (dipakai RLS/authorization)
create index if not exists idx_profiles_role
  on public.profiles (role);

-- sales: ownership lookup (sales.user_id -> login user) dan filter active
create index if not exists idx_sales_user_id
  on public.sales (user_id);
create index if not exists idx_sales_is_active
  on public.sales (is_active);

-- invoices: relationship dan filtering utama
create index if not exists idx_invoices_customer_id
  on public.invoices (customer_id);
create index if not exists idx_invoices_sales_id
  on public.invoices (sales_id);
create index if not exists idx_invoices_status
  on public.invoices (status);
create index if not exists idx_invoices_due_date
  on public.invoices (due_date);

-- invoice_number: unique constraint di migration 008_constraints.sql
-- sudah membuat index unik tersendiri, sehingga tidak perlu index tambahan.

-- invoice_status_history: lookup history per invoice dan per actor
create index if not exists idx_invoice_status_history_invoice_id
  on public.invoice_status_history (invoice_id);
create index if not exists idx_invoice_status_history_changed_by
  on public.invoice_status_history (changed_by);
