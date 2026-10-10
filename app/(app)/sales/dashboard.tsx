import { Stack } from 'expo-router';

import { DashboardCard } from '@/components/DashboardCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/hooks/useAsync';
import { getSalesDashboardSummary } from '@/services/dashboardService';

/**
 * Sales Dashboard (TB-74, TB-76).
 *
 * Hanya menampilkan ringkasan invoice milik sales yang sedang login:
 * RLS `invoices_select_own` memastikan invoice sales lain tidak pernah
 * ikut terhitung. Tidak ada data sales lain, ranking, atau skor performa.
 */
export default function SalesDashboardScreen() {
  const { data, loading, error, reload } = useAsync(getSalesDashboardSummary, [], {
    refetchOnFocus: true,
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard' }} />
      <Screen>
        {loading ? (
          <Loading message="Memuat dashboard..." />
        ) : error ? (
          <ErrorState message={error || 'Data dashboard gagal dimuat.'} onRetry={() => void reload()} />
        ) : (
          <>
            <DashboardCard
              description="Invoice yang ditugaskan kepada Anda"
              title="Total Invoice Saya"
              value={data?.totalInvoices ?? 0}
            />
            <DashboardCard
              description="Menunggu penagihan"
              title="Belum Ditagih"
              value={data?.belumDitagih ?? 0}
              variant="warning"
            />
            <DashboardCard
              description="Sudah ditagih, menunggu pembayaran"
              title="Sudah Ditagih"
              value={data?.sudahDitagih ?? 0}
              variant="info"
            />
            <DashboardCard
              description="Pembayaran diterima"
              title="Dibayar"
              value={data?.dibayar ?? 0}
              variant="success"
            />
            {data && data.totalInvoices === 0 ? (
              <EmptyState
                description="Belum ada invoice yang ditugaskan kepada Anda. Invoice akan muncul di sini setelah admin menugaskannya."
                title="Belum ada invoice untuk Anda"
              />
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}
