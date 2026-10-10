import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as XLSX from 'xlsx';

import { AppError } from '@/utils/error';
import { buildReportWorkbook, reportFileName } from '@/utils/reportExcel';
import type { DashboardSummary, SalesReportRow } from '@/types/dashboard';
import type { InvoiceSummary } from '@/types/invoice';

/**
 * TB-83 — Report Export (implementasi nyata: Excel / .xlsx).
 *
 * Konsumen: layar Reports (tombol "Download Excel").
 * - Data berasal dari payload report yang SUDAH diperbarui sesuai filter
 *   periode yang sedang aktif (RPC `collection_report_summary` +
 *   `collection_report_by_sales` + list invoice periode berjalan) -
 *   tidak pernah data dummy.
 * - File ditulis ke cache directory lalu dibuka lewat share sheet
 *   (Android/iOS); di web, SheetJS memicu download browser.
 * - Format selain xlsx belum didukung (PDF/CSV tetap di luar scope).
 */

export type ReportExportFormat = 'pdf' | 'xlsx' | 'csv';

/**
 * Struktur data report yang siap diexport.
 * `admin/reports.tsx` membangun persis type ini dari data RPC periode aktif.
 */
export interface ReportExportPayload {
  /** Judul laporan, mis. "Collection Report". */
  title: string;
  /** Periode laporan (invoice_date). */
  period: { startDate: string; endDate: string };
  /** Ringkasan periode (hasil `collection_report_summary`). */
  summary: DashboardSummary;
  /** Rincian per sales (hasil `collection_report_by_sales`). */
  rows: readonly SalesReportRow[];
  /** Detail invoice pada periode aktif (list invoice, RLS tetap berlaku). */
  invoices: readonly InvoiceSummary[];
}

/** Kontrak service export. */
export interface ReportExportService {
  exportReport(format: ReportExportFormat, data: ReportExportPayload): Promise<void>;
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function exportReport(
  format: ReportExportFormat,
  data: ReportExportPayload,
): Promise<void> {
  if (format !== 'xlsx') {
    throw new AppError('validation', 'Format export saat ini hanya mendukung Excel (.xlsx).');
  }

  const workbook = buildReportWorkbook(data);
  const filename = reportFileName(data.period);

  try {
    if (Platform.OS === 'web') {
      // Web: tulis ke Blob + unduh via link (File/Paths tidak didukung web).
      const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
      const blob = new Blob([output], { type: XLSX_MIME });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      return;
    }

    const file = new File(Paths.cache, filename);
    if (file.exists) {
      file.delete();
    }
    file.create();

    const output = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    file.write(new Uint8Array(output));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: XLSX_MIME,
        dialogTitle: 'Bagikan Laporan Collection',
      });
    }
  } catch (caught) {
    if (caught instanceof AppError) {
      throw caught;
    }
    throw new AppError('database', 'File Excel gagal dibuat. Silakan coba lagi.', {
      originalError: caught,
    });
  }
}
