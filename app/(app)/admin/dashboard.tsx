import { router, Stack } from 'expo-router';

import { DashboardCard } from '@/components/DashboardCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useAsync } from '@/hooks/useAsync';
import { getAdminDashboardSummary } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/currency';

/**
 * Admin Dashboard (TB-72, TB-76).
 *
 * Semua angka berasal dari RPC `dashboard_summary` (agregasi database,
 * TB-73/TB-81) - tidak ada hardcoded dan tidak ada seluruh invoice yang
 * diunduh ke device. Route dilindungi role guard admin + RLS.
 */
export default function AdminDashboardScreen() {
  const { data, loading, error, reload } = useAsync(getAdminDashboardSummary, [], {
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
              description="Seluruh invoice dalam scope admin"
              title="Total Invoice"
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
            <DashboardCard
              description="Total nominal seluruh invoice"
              title="Total Nominal"
              value={formatCurrency(data?.totalAmount ?? 0)}
            />
            {data && data.totalInvoices === 0 ? (
              <EmptyState
                action={{
                  label: 'Tambah Invoice',
                  onPress: () => router.push('/admin/invoices/create'),
                }}
                description="Belum ada invoice sama sekali. Buat invoice pertama untuk memulai."
                title="Belum ada data invoice"
              />
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}
