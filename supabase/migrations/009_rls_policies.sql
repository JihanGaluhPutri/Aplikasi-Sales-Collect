-- =============================================================================
-- TB-16 / TB-17 / TB-18 — Row Level Security
--
-- Prinsip: frontend BUKAN security boundary.
-- Seluruh pembatasan akses (role + ownership) dipaksa oleh database.
--
-- Akses yang dihasilkan:
--   ADMIN            -> seluruh data sesuai tanggung jawab admin
--   SALES            -> hanya invoice miliknya + customer terkait invoice miliknya
--   SALES A vs B     -> terpisah: A tidak dapat membaca/mengubah data B
--   TANPA LOGIN      -> tidak ada akses sama sekali (tidak ada policy untuk anon)
--
-- Helper memakai SECURITY DEFINER agar pemeriksaan role/ownership tidak
-- terkena RLS-nya sendiri (mencegah infinite recursion antar tabel).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is 'True jika authenticated user saat ini memiliki role admin.';

create or replace function public.can_access_invoice(p_invoice_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.id = p_invoice_id
        and s.user_id = (select auth.uid())
    );
$$;

comment on function public.can_access_invoice(uuid) is 'True jika user berhak atas invoice tersebut (admin atau sales pemilik).';

create or replace function public.can_access_customer(p_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.invoices i
      join public.sales s on s.id = i.sales_id
      where i.customer_id = p_customer_id
        and s.user_id = (select auth.uid())
    );
$$;

comment on function public.can_access_customer(uuid) is 'True jika customer punya invoice milik user tersebut (atau user admin).';

-- ---------------------------------------------------------------------------
-- TB-16 — Aktifkan RLS pada semua tabel aplikasi
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.sales enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_status_history enable row level security;

-- ---------------------------------------------------------------------------
-- TB-17 / TB-18 — Policies: profiles
-- ---------------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Self-register hanya boleh membuat profile dengan role 'sales'.
-- Role 'admin' hanya dapat dibuat oleh admin (provisioning terkontrol, TB-36).
drop policy if exists profiles_insert_self_or_admin on public.profiles;
create policy profiles_insert_self_or_admin on public.profiles
  for insert to authenticated
  with check (
    (id = (select auth.uid()) and role = 'sales')
    or public.is_admin()
  );

-- User non-admin hanya dapat mengubah profile sendiri dan tidak boleh
-- menaikkan role dirinya menjadi admin.
drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (
    (id = (select auth.uid()) and role = 'sales')
    or public.is_admin()
  );

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Policies: sales
-- ---------------------------------------------------------------------------

drop policy if exists sales_select_admin on public.sales;
create policy sales_select_admin on public.sales
  for select to authenticated
  using (public.is_admin());

-- Sales dapat membaca record sales miliknya sendiri (dibutuhkan untuk ownership).
drop policy if exists sales_select_own on public.sales;
create policy sales_select_own on public.sales
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Hanya admin yang dapat membuat/mengubah/menghapus data sales.
drop policy if exists sales_insert_admin on public.sales;
create policy sales_insert_admin on public.sales
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists sales_update_admin on public.sales;
create policy sales_update_admin on public.sales
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists sales_delete_admin on public.sales;
create policy sales_delete_admin on public.sales
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Policies: customers
-- ---------------------------------------------------------------------------

drop policy if exists customers_select_admin on public.customers;
create policy customers_select_admin on public.customers
  for select to authenticated
  using (public.is_admin());

-- Sales hanya dapat melihat customer yang terkait dengan invoice miliknya.
drop policy if exists customers_select_related on public.customers;
create policy customers_select_related on public.customers
  for select to authenticated
  using (public.can_access_customer(id));

drop policy if exists customers_insert_admin on public.customers;
create policy customers_insert_admin on public.customers
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists customers_update_admin on public.customers;
create policy customers_update_admin on public.customers
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists customers_delete_admin on public.customers;
create policy customers_delete_admin on public.customers
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- TB-18 — Policies: invoices (role + ownership)
-- ---------------------------------------------------------------------------

drop policy if exists invoices_select_admin on public.invoices;
create policy invoices_select_admin on public.invoices
  for select to authenticated
  using (public.is_admin());

-- Sales A hanya dapat membaca invoice yang sales_id-nya terhubung
-- dengan record sales milik login user tersebut. Invoice sales lain
-- tidak pernah dikembalikan oleh database.
drop policy if exists invoices_select_own on public.invoices;
create policy invoices_select_own on public.invoices
  for select to authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = invoices.sales_id
        and s.user_id = (select auth.uid())
    )
  );

drop policy if exists invoices_insert_admin on public.invoices;
create policy invoices_insert_admin on public.invoices
  for insert to authenticated
  with check (public.is_admin());

-- Sales dapat memperbarui invoice MILIKNYA saja.
-- WITH CHECK memastikan invoice tidak dapat dipindahkan ke sales lain
-- (atau dilepas dari kepemilikan) oleh sales yang bersangkutan.
drop policy if exists invoices_update_own on public.invoices;
create policy invoices_update_own on public.invoices
  for update to authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = invoices.sales_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = invoices.sales_id
        and s.user_id = (select auth.uid())
    )
  );

drop policy if exists invoices_update_admin on public.invoices;
create policy invoices_update_admin on public.invoices
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists invoices_delete_admin on public.invoices;
create policy invoices_delete_admin on public.invoices
  for delete to authenticated
  using (public.is_admin());

-- Sales tidak memiliki policy INSERT dan DELETE sama sekali:
-- insert/delete invoice ditolak database, bukan hanya disembunyikan di UI.

-- ---------------------------------------------------------------------------
-- Policies: invoice_status_history
-- ---------------------------------------------------------------------------

drop policy if exists invoice_status_history_select_admin on public.invoice_status_history;
create policy invoice_status_history_select_admin on public.invoice_status_history
  for select to authenticated
  using (public.is_admin());

drop policy if exists invoice_status_history_select_related on public.invoice_status_history;
create policy invoice_status_history_select_related on public.invoice_status_history
  for select to authenticated
  using (public.can_access_invoice(invoice_id));

-- Tidak ada policy INSERT/UPDATE/DELETE untuk user biasa.
-- History hanya ditulis oleh database function/RPC (TB-63, PART 2)
-- sehingga setiap perubahan status selalu tercatat secara atomic.

-- ---------------------------------------------------------------------------
-- Grants
-- RLS hanya efektif jika role memiliki privilege membaca tabel.
-- Hak akses tetap dibatasi oleh policy di atas.
--
-- `anon` (request tanpa login) TIDAK diberi privilege apa pun pada tabel
-- aplikasi: bahkan jika ada kekeliruan policy, request tanpa session tetap
-- ditolak di lapisan privilege.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

-- -----------------------------------------------------------------------------
-- Ringkasan akses (ditegakkan oleh policy di atas):
--
-- | Tabel                   | ADMIN                | SALES                          | ANON |
-- |-------------------------|----------------------|--------------------------------|------|
-- | profiles                | read/write semua     | read/write profile sendiri     | none |
-- | sales                   | read/write semua     | read record sendiri            | none |
-- | customers               | read/write semua     | read customer invoice miliknya | none |
-- | invoices                | read/write/delete    | read + update invoice miliknya | none |
-- | invoice_status_history  | read                 | read history invoice miliknya  | none |
-- -----------------------------------------------------------------------------
