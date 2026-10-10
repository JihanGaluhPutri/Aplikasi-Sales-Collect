/**
 * Tipe dashboard & report (TB-73, TB-78, TB-79).
 *
 * Semua nilai berasal dari agregasi database (RPC `dashboard_summary`,
 * `collection_report_summary`, `collection_report_by_sales`) - tidak ada
 * angka hardcoded dan tidak ada perhitungan agregat di device.
 */

export interface DashboardSummary {
  totalInvoices: number;
  belumDitagih: number;
  sudahDitagih: number;
  dibayar: number;
  totalAmount: number;
}

/** Satu baris laporan distribusi invoice per sales (TB-79) - data faktual. */
export interface SalesReportRow {
  /** `null` = invoice yang belum ditugaskan ke sales mana pun. */
  salesId: string | null;
  salesName: string;
  totalInvoices: number;
  belumDitagih: number;
  sudahDitagih: number;
  dibayar: number;
  totalAmount: number;
}

/** Periode laporan dalam format `YYYY-MM-DD` (konsisten dengan field date DB). */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Bentuk baris hasil fungsi SQL (kolom snake_case) - dipakai sebagai `Returns`
 * RPC di types/database.ts lalu dipetakan ke tipe camelCase di atas.
 */
export interface DashboardSummaryRow {
  total_invoices: number;
  belum_ditagih: number;
  sudah_ditagih: number;
  dibayar: number;
  total_amount: number;
}

export interface CollectionReportSummaryRow {
  total_invoices: number;
  total_amount: number;
  belum_ditagih: number;
  sudah_ditagih: number;
  dibayar: number;
}

export interface SalesReportRowDb {
  sales_id: string | null;
  sales_name: string;
  total_invoices: number;
  belum_ditagih: number;
  sudah_ditagih: number;
  dibayar: number;
  total_amount: number;
}
