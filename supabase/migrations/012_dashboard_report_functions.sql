-- =============================================================================
-- 012_dashboard_report_functions.sql (TB-73, TB-78, TB-79, TB-81)
--
-- Aggregation dashboard & report dilakukan DI DATABASE (COUNT/SUM/FILTER/
-- GROUP BY), bukan di device. Client hanya menerima beberapa angka - tidak
-- pernah mengunduh seluruh invoice untuk dihitung di React Native.
--
-- KEAMANAN: semua fungsi SECURITY INVOKER -> dijalankan dengan hak role yang
-- memanggil, sehingga RLS pada `invoices` dan `sales` tetap berlaku penuh:
--   * admin      -> melihat seluruh invoice (scope admin)
--   * sales      -> hanya invoice miliknya sendiri
--   * anon       -> di-REVOKE dari execute, ditambah RLS tidak memberi baris
-- Fungsi tidak memakai service-role key dan tidak mem-bypass authorization.
-- =============================================================================

create or replace function public.dashboard_summary ()
returns table (
  total_invoices bigint,
  belum_ditagih   bigint,
  sudah_ditagih   bigint,
  dibayar         bigint,
  total_amount    numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)::bigint,
    count(*) filter (where i.status = 'belum_ditagih')::bigint,
    count(*) filter (where i.status = 'sudah_ditagih')::bigint,
    count(*) filter (where i.status = 'dibayar')::bigint,
    coalesce(sum(i.amount), 0)::numeric
  from public.invoices i;
$$;

-- Laporan collection per periode (basis: invoice_date) - TB-78.
create or replace function public.collection_report_summary (p_start date, p_end date)
returns table (
  total_invoices bigint,
  total_amount   numeric,
  belum_ditagih  bigint,
  sudah_ditagih  bigint,
  dibayar        bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)::bigint,
    coalesce(sum(i.amount), 0)::numeric,
    count(*) filter (where i.status = 'belum_ditagih')::bigint,
    count(*) filter (where i.status = 'sudah_ditagih')::bigint,
    count(*) filter (where i.status = 'dibayar')::bigint
  from public.invoices i
  where i.invoice_date >= p_start
    and i.invoice_date <= p_end;
$$;

-- Distribusi invoice per sales pada periode (tanpa ranking/score) - TB-79.
-- `sales_id` NULL = invoice yang belum ditugaskan (bucket "Belum ditugaskan").
-- Urutan berdasarkan nama (faktual), bukan berdasarkan performa.
create or replace function public.collection_report_by_sales (p_start date, p_end date)
returns table (
  sales_id       uuid,
  sales_name     text,
  total_invoices bigint,
  belum_ditagih  bigint,
  sudah_ditagih  bigint,
  dibayar        bigint,
  total_amount   numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    s.id,
    coalesce(s.name, 'Belum ditugaskan'),
    count(i.id)::bigint,
    count(i.id) filter (where i.status = 'belum_ditagih')::bigint,
    count(i.id) filter (where i.status = 'sudah_ditagih')::bigint,
    count(i.id) filter (where i.status = 'dibayar')::bigint,
    coalesce(sum(i.amount), 0)::numeric
  from public.invoices i
  left join public.sales s on s.id = i.sales_id
  where i.invoice_date >= p_start
    and i.invoice_date <= p_end
  group by s.id, s.name
  order by coalesce(s.name, 'Belum ditugaskan') asc;
$$;

-- Hanya user terautentikasi yang boleh memanggil fungsi agregasi.
revoke execute on function public.dashboard_summary() from public, anon;
revoke execute on function public.collection_report_summary(date, date) from public, anon;
revoke execute on function public.collection_report_by_sales(date, date) from public, anon;

grant execute on function public.dashboard_summary() to authenticated;
grant execute on function public.collection_report_summary(date, date) to authenticated;
grant execute on function public.collection_report_by_sales(date, date) to authenticated;
