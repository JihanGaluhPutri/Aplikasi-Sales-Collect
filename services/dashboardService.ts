import { supabase } from '@/lib/supabase';
import type {
  CollectionReportSummaryRow,
  DashboardSummary,
  DashboardSummaryRow,
  DateRange,
  SalesReportRow,
  SalesReportRowDb,
} from '@/types/dashboard';
import { AppError, toAppError } from '@/utils/error';
import { validateDateRange, validateISODate } from '@/utils/validation';

/**
 * Service layer dashboard & report (TB-73, TB-78, TB-79, TB-81).
 *
 * SEMUA angka dihasilkan oleh agregasi database (RPC security-invoker):
 * COUNT / SUM / COUNT(*) FILTER / GROUP BY dijalankan di PostgreSQL,
 * device hanya menerima beberapa angka - tidak pernah mengunduh seluruh
 * invoice untuk dihitung di React Native.
 *
 * RLS tetap menjadi lapisan keamanan utama:
 * - admin  -> agregasi seluruh invoice dalam scope admin
 * - sales  -> hanya invoice miliknya sendiri (invoices_select_own)
 * - anon   -> tidak memiliki execute grant untuk fungsi ini
 * Tidak ada service-role key yang dipakai.
 */

function firstRow<T>(rows: T[] | null): T | undefined {
  return rows && rows.length > 0 ? rows[0] : undefined;
}

function toSummary(row: DashboardSummaryRow | undefined): DashboardSummary {
  return {
    totalInvoices: Number(row?.total_invoices ?? 0),
    belumDitagih: Number(row?.belum_ditagih ?? 0),
    sudahDitagih: Number(row?.sudah_ditagih ?? 0),
    dibayar: Number(row?.dibayar ?? 0),
    totalAmount: Number(row?.total_amount ?? 0),
  };
}

/** Validasi periode sebelum query dijalankan (TB-80) - query tidak dijalankan jika invalid. */
function assertValidRange(range: DateRange): void {
  const startError = validateISODate(range.startDate);
  if (startError) {
    throw new AppError('validation', startError);
  }
  const endError = validateISODate(range.endDate);
  if (endError) {
    throw new AppError('validation', endError);
  }
  const rangeError = validateDateRange(range.startDate, range.endDate);
  if (rangeError) {
    throw new AppError('validation', rangeError);
  }
}

/**
 * Ringkasan dashboard admin (TB-72).
 * Admin melihat seluruh invoice sesuai scope admin di RLS.
 */
export async function getAdminDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc('dashboard_summary');

  if (error) {
    throw toAppError(error);
  }

  return toSummary(firstRow<DashboardSummaryRow>(data));
}

/**
 * Ringkasan dashboard sales (TB-74).
 *
 * Memanggil RPC yang sama - RLS `invoices_select_own` memastikan sales
 * hanya menghitung invoice miliknya sendiri. Angka sales lain tidak mungkin
 * ikut terhitung karena barisnya tidak pernah terbaca oleh database.
 */
export async function getSalesDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc('dashboard_summary');

  if (error) {
    throw toAppError(error);
  }

  return toSummary(firstRow<DashboardSummaryRow>(data));
}

/**
 * Collection report per periode (TB-78) - basis `invoice_date`
 * (konsisten untuk semua laporan).
 */
export async function getCollectionReportSummary(range: DateRange): Promise<DashboardSummary> {
  assertValidRange(range);

  const { data, error } = await supabase.rpc('collection_report_summary', {
    p_start: range.startDate,
    p_end: range.endDate,
  });

  if (error) {
    throw toAppError(error);
  }

  const row = firstRow<CollectionReportSummaryRow>(data);
  return {
    totalInvoices: Number(row?.total_invoices ?? 0),
    belumDitagih: Number(row?.belum_ditagih ?? 0),
    sudahDitagih: Number(row?.sudah_ditagih ?? 0),
    dibayar: Number(row?.dibayar ?? 0),
    totalAmount: Number(row?.total_amount ?? 0),
  };
}

/**
 * Report by sales (TB-79) - distribusi faktual per sales + bucket
 * "Belum ditugaskan". Tanpa ranking/score/penilaian performa,
 * urutan mengikuti nama sales.
 */
export async function getCollectionReportBySales(range: DateRange): Promise<SalesReportRow[]> {
  assertValidRange(range);

  const { data, error } = await supabase.rpc('collection_report_by_sales', {
    p_start: range.startDate,
    p_end: range.endDate,
  });

  if (error) {
    throw toAppError(error);
  }

  return (data ?? []).map((row: SalesReportRowDb) => ({
    salesId: row.sales_id,
    salesName: row.sales_name,
    totalInvoices: Number(row.total_invoices),
    belumDitagih: Number(row.belum_ditagih),
    sudahDitagih: Number(row.sudah_ditagih),
    dibayar: Number(row.dibayar),
    totalAmount: Number(row.total_amount),
  }));
}
