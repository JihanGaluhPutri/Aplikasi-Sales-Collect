-- =============================================================================
-- TB-15 — Database Constraints
-- Lapisan keamanan tambahan di database. Validasi frontend tidak cukup:
-- request yang datang langsung ke Supabase tetap harus ditolak jika invalid.
--
-- Catatan:
--   * role      : sudah dijamin enum public.user_role ('admin', 'sales')
--   * status    : sudah dijamin enum public.invoice_status
--   * foreign key: sudah didefinisikan pada migration tabel masing-masing
--   * not null  : sudah didefinisikan pada migration tabel masing-masing
-- =============================================================================

-- Invoice number harus unik.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_invoice_number_key'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_invoice_number_key unique (invoice_number);
  end if;
end $$;

-- Amount tidak boleh negatif.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_amount_check'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_amount_check check (amount >= 0);
  end if;
end $$;

-- Jatuh tempo tidak boleh sebelum tanggal invoice.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_due_date_check'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_due_date_check check (due_date >= invoice_date);
  end if;
end $$;

-- Satu account user hanya terhubung ke satu record sales.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_user_id_key'
      and conrelid = 'public.sales'::regclass
  ) then
    alter table public.sales
      add constraint sales_user_id_key unique (user_id);
  end if;
end $$;

-- Nama tidak boleh hanya spasi/kosong.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_name_not_blank'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_name_not_blank check (char_length(trim(name)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_name_not_blank'
      and conrelid = 'public.sales'::regclass
  ) then
    alter table public.sales
      add constraint sales_name_not_blank check (char_length(trim(name)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'customers_name_not_blank'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_name_not_blank check (char_length(trim(name)) > 0);
  end if;
end $$;

-- Invoice number tidak boleh hanya spasi/kosong.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_invoice_number_not_blank'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_invoice_number_not_blank
      check (char_length(trim(invoice_number)) > 0);
  end if;
end $$;
