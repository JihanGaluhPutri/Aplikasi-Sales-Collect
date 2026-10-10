import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DashboardCard } from '@/components/DashboardCard';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import {
  getCollectionReportBySales,
  getCollectionReportSummary,
} from '@/services/dashboardService';
import { getInvoices } from '@/services/invoiceService';
import { exportReport } from '@/services/reportExportService';
import type { DashboardSummary, DateRange, SalesReportRow } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { getUserMessage } from '@/utils/error';
import { validateDateRange } from '@/utils/validation';

/**
 * Reports (TB-78 Collection Report, TB-79 Report by Sales, TB-80 filter
 * periode, TB-82 empty state) + enhancement UX:
 *
 * - Seluruh layar full vertical scroll (Screen default ScrollView); kartu
 *   ringkasan disusun compact 2 baris grid agar langsung terlihat.
 * - Tabel "Laporan per Sales" digulir horizontal (5 kolom) sehingga angka
 *   tidak pernah terpotong di layar sempit.
 * - Download Excel (.xlsx) mengikuti filter periode yang sedang aktif dan
 *   berisi 3 sheet: Laporan Collection (ringkasan), Detail Invoice, serta
 *   Laporan per Sales.
 *
 * Data diambil lewat RPC agregasi database per periode (basis
 * `invoice_date`) - bukan fetch seluruh invoice ke device (TB-81).
 * Report by sales bersifat faktual: distribusi + status, tanpa ranking,
 * top sales, skor, atau penilaian performa.
 */

/** Lebar kolom tabel per sales (digulir horizontal di layar sempit). */
const NAME_CELL_WIDTH = 150;
const NUM_CELL_WIDTH = 84;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Periode default: bulan berjalan (contoh: 01 Sep 2026 - 30 Sep 2026). */
function currentMonthRange(): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    startDate: `${year}-${pad2(month + 1)}-01`,
    endDate: `${year}-${pad2(month + 1)}-${pad2(lastDay)}`,
  };
}

interface ReportData {
  summary: DashboardSummary;
  bySales: SalesReportRow[];
}

export default function ReportsScreen() {
  const toast = useToast();
  const startInputRef = useRef<TextInput>(null);
  const [applied, setApplied] = useState<DateRange>(() => currentMonthRange());
  const [draftStart, setDraftStart] = useState(applied.startDate);
  const [draftEnd, setDraftEnd] = useState(applied.endDate);
  // Setelah user menekan Terapkan sekali, tombol ikut loading selama data
  // periode dimuat - mencegah submit berulang (TB-86/TB-84).
  const [applyTouched, setApplyTouched] = useState(false);
  const [exporting, setExporting] = useState(false);

  const draftOrderError = validateDateRange(draftStart, draftEnd);

  const { data, loading, error, reload } = useAsync<ReportData>(
    () =>
      Promise.all([
        getCollectionReportSummary(applied),
        getCollectionReportBySales(applied),
      ]).then(([summary, bySales]) => ({ summary, bySales })),
    [applied.startDate, applied.endDate],
    { refetchOnFocus: true },
  );

  // Query hanya dijalankan saat rentang valid (TB-80) - tombol Terapkan
  // juga sudah dinonaktifkan oleh DateRangeFilter selama rentang invalid,
  // dan selama permintaan sebelumnya masih berjalan.
  const handleApply = () => {
    if (draftOrderError || loading) {
      return;
    }
    setApplyTouched(true);
    setApplied({ startDate: draftStart.trim(), endDate: draftEnd.trim() });
  };

  /**
   * Export Excel mengikuti filter periode AKTIF (data RPC yang sedang
   * ditampilkan) - bukan seluruh database. Detail invoice diambil saat
   * tombol ditekan (ikut periode + RLS) sehingga sheet Detail Invoice
   * selalu up-to-date. Loading + success/error feedback.
   */
  const handleExport = () => {
    if (!data || exporting) {
      return;
    }
    setExporting(true);
    getInvoices({ startDate: applied.startDate, endDate: applied.endDate })
      .then((invoices) =>
        exportReport('xlsx', {
          title: 'Collection Report',
          period: applied,
          summary: data.summary,
          rows: data.bySales,
          invoices,
        }),
      )
      .then(() => toast.success('File Excel berhasil dibuat.'))
      .catch((caught: unknown) => toast.error(getUserMessage(caught)))
      .finally(() => setExporting(false));
  };

  const summary = data?.summary;

  return (
    <>
      <Stack.Screen options={{ title: 'Reports' }} />
      <Screen>
        <DateRangeFilter
          applying={applyTouched && loading}
          endDate={draftEnd}
          onChangeEnd={setDraftEnd}
          onChangeStart={setDraftStart}
          onApply={handleApply}
          startInputRef={startInputRef}
          startDate={draftStart}
        />

        <Text style={styles.period}>
          Periode: {formatDate(applied.startDate)} - {formatDate(applied.endDate)}
        </Text>

        {loading ? (
          <Loading message="Memuat laporan..." />
        ) : error ? (
          <ErrorState message={error || 'Data laporan gagal dimuat.'} onRetry={() => void reload()} />
        ) : summary && summary.totalInvoices === 0 ? (
          <EmptyState
            action={{ label: 'Ubah Periode', onPress: () => startInputRef.current?.focus() }}
            description="Belum ada data collection untuk periode yang dipilih. Coba pilih periode lain."
            title="Belum ada data pada periode ini."
          />
        ) : summary ? (
          <>
            {/* Ringkasan compact: Total Nominal full-width, sisanya 2 kolom. */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryWide}>
                <DashboardCard title="Total Nominal" value={formatCurrency(summary.totalAmount)} />
              </View>
              <View style={styles.summaryHalf}>
                <DashboardCard title="Total Invoice" value={summary.totalInvoices} />
              </View>
              <View style={styles.summaryHalf}>
                <DashboardCard
                  title="Belum Ditagih"
                  value={summary.belumDitagih}
                  variant="warning"
                />
              </View>
              <View style={styles.summaryHalf}>
                <DashboardCard
                  title="Sudah Ditagih"
                  value={summary.sudahDitagih}
                  variant="info"
                />
              </View>
              <View style={styles.summaryHalf}>
                <DashboardCard title="Dibayar" value={summary.dibayar} variant="success" />
              </View>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Laporan per Sales</Text>
              <Text style={styles.sectionHint}>
                Distribusi invoice berdasarkan sales - data faktual tanpa peringkat. Geser tabel ke
                samping untuk melihat semua kolom.
              </Text>

              <ScrollView
                contentContainerStyle={styles.tableScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.nameCell]}>Sales</Text>
                    <Text style={[styles.headerCell, styles.numCell]}>Total</Text>
                    <Text style={[styles.headerCell, styles.numCell]}>Belum</Text>
                    <Text style={[styles.headerCell, styles.numCell]}>Ditagih</Text>
                    <Text style={[styles.headerCell, styles.numCell]}>Dibayar</Text>
                  </View>

                  {(data?.bySales ?? []).map((row) => (
                    <View key={row.salesId ?? 'unassigned'} style={styles.tableRow}>
                      <Text numberOfLines={1} style={[styles.nameCell, styles.cell]}>
                        {row.salesName}
                      </Text>
                      <Text style={[styles.numCell, styles.cell]}>{row.totalInvoices}</Text>
                      <Text style={[styles.numCell, styles.cell]}>{row.belumDitagih}</Text>
                      <Text style={[styles.numCell, styles.cell]}>{row.sudahDitagih}</Text>
                      <Text style={[styles.numCell, styles.cell]}>{row.dibayar}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Card>

            <Button
              disabled={exporting}
              loading={exporting}
              onPress={handleExport}
              title="Download Excel"
            />
          </>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  period: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryWide: {
    flexBasis: '100%',
    flexGrow: 1,
  },
  summaryHalf: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 140,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  sectionHint: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  tableScroll: {
    paddingRight: spacing.xl,
  },
  tableHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.xs,
  },
  tableRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  headerCell: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  cell: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  nameCell: {
    width: NAME_CELL_WIDTH,
    paddingRight: spacing.sm,
  },
  numCell: {
    width: NUM_CELL_WIDTH,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
});
