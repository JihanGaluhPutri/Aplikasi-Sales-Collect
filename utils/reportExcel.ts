import * as XLSX from 'xlsx';

import { INVOICE_STATUS_META } from '@/constants/status';
import type { DashboardSummary, DateRange, SalesReportRow } from '@/types/dashboard';
import type { InvoiceSummary } from '@/types/invoice';
import { formatDate } from '@/utils/date';

/**
 * Builder workbook Excel (.xlsx) untuk export Report (enhancement pasca-MVP,
 * menggantikan "Report Export Preparation" TB-83 dengan implementasi nyata).
 *
 * Murni fungsi transformasi data (tanpa akses storage/UI) sehingga bisa
 * diuji secara terpisah. Sumber data TETAP RPC database per periode
 * (collection_report_summary + collection_report_by_sales) untuk
 * ringkasan/per sales, dan list invoice periode aktif (RLS tetap berlaku)
 * untuk sheet Detail Invoice - tidak ada perhitungan agregat baru di sini.
 */
export const REPORT_SUMMARY_SHEET = 'Laporan Collection';
export const REPORT_DETAIL_SHEET = 'Detail Invoice';
export const REPORT_BY_SALES_SHEET = 'Laporan per Sales';

export interface ReportWorkbookInput {
  /** Judul laporan, mis. "Collection Report". */
  title: string;
  /** Periode laporan (invoice_date). */
  period: DateRange;
  summary: DashboardSummary;
  rows: readonly SalesReportRow[];
  /**
   * Detail invoice pada periode aktif (opsional: sheet tetap dibuat walau
   * kosong sehingga struktur workbook selalu konsisten).
   */
  invoices?: readonly InvoiceSummary[];
}

type Cell = string | number;

function periodLabel(period: DateRange): string {
  return `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`;
}

/** Sheet 1: identitas periode + ringkasan collection. */
export function buildSummarySheet(input: ReportWorkbookInput): Cell[][] {
  return [
    [input.title],
    ['Periode', periodLabel(input.period)],
    [],
    ['Metrik', 'Nilai'],
    ['Total Invoice', input.summary.totalInvoices],
    ['Total Nominal (Rp)', input.summary.totalAmount],
    ['Belum Ditagih', input.summary.belumDitagih],
    ['Sudah Ditagih', input.summary.sudahDitagih],
    ['Dibayar', input.summary.dibayar],
  ];
}

/** Sheet 2: rincian invoice pada periode aktif (ikut filter periode berjalan). */
export function buildDetailSheet(input: ReportWorkbookInput): Cell[][] {
  const header: Cell[] = [
    'No Invoice',
    'Customer',
    'Sales',
    'Amount',
    'Tanggal Invoice',
    'Jatuh Tempo',
    'Status',
    'Bukti Pembayaran',
  ];

  const body: Cell[][] = (input.invoices ?? []).map((invoice) => [
    invoice.invoice_number,
    invoice.customerName ?? '-',
    invoice.salesName ?? '-',
    invoice.amount,
    invoice.invoice_date,
    invoice.due_date,
    INVOICE_STATUS_META[invoice.status].label,
    invoice.payment_proof_path ? 'Ada' : 'Belum',
  ]);

  return [[input.title], ['Periode', periodLabel(input.period)], [], header, ...body];
}

/** Sheet 3: rincian per sales (data faktual, tanpa ranking). */
export function buildBySalesSheet(input: ReportWorkbookInput): Cell[][] {
  const header: Cell[] = [
    'Sales',
    'Total Invoice',
    'Total Nominal (Rp)',
    'Belum Ditagih',
    'Sudah Ditagih',
    'Dibayar',
  ];

  const body: Cell[][] = input.rows.map((row) => [
    row.salesName,
    row.totalInvoices,
    row.totalAmount,
    row.belumDitagih,
    row.sudahDitagih,
    row.dibayar,
  ]);

  return [[input.title], ['Periode', periodLabel(input.period)], [], header, ...body];
}

/** Susun workbook: Ringkasan -> Detail Invoice -> Laporan per Sales. */
export function buildReportWorkbook(input: ReportWorkbookInput): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet(buildSummarySheet(input));
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, REPORT_SUMMARY_SHEET);

  const detailSheet = XLSX.utils.aoa_to_sheet(buildDetailSheet(input));
  detailSheet['!cols'] = [
    { wch: 24 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(workbook, detailSheet, REPORT_DETAIL_SHEET);

  const bySalesSheet = XLSX.utils.aoa_to_sheet(buildBySalesSheet(input));
  bySalesSheet['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, bySalesSheet, REPORT_BY_SALES_SHEET);

  return workbook;
}

/** Nama file export: SalesCollect_Report_{mulai}_{akhir}.xlsx */
export function reportFileName(period: DateRange): string {
  return `SalesCollect_Report_${period.startDate}_${period.endDate}.xlsx`;
}
