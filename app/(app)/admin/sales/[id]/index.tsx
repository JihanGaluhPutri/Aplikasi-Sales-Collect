import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceListItem } from '@/components/InvoiceListItem';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { useAsync } from '@/hooks/useAsync';
import { getSalesById, getSalesInvoices, setSalesActive } from '@/services/salesService';
import type { InvoiceSummary, InvoiceStatus } from '@/types/invoice';
import type { Sales } from '@/types/sales';
import { getUserMessage } from '@/utils/error';

interface SalesDetailData {
  sales: Sales;
  invoices: InvoiceSummary[];
}

/**
 * Detail sales (TB-47): data sales, ringkasan invoice yang ditugaskan
 * (total / belum ditagih / sudah ditagih / dibayar), daftar invoice,
 * dan toggle aktif/nonaktif (TB-48).
 *
 * Menonaktifkan sales TIDAK menghapus data historical - invoice lama
 * tetap ada dan hanya assignment BARU yang diblokir.
 */
export default function SalesDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const salesId = id ?? '';

  const { data, loading, error, reload } = useAsync<SalesDetailData | null>(
    async () => {
      const sales = await getSalesById(salesId);
      if (!sales) {
        return null;
      }
      const invoices = await getSalesInvoices(salesId);
      return { sales, invoices };
    },
    [salesId],
    { refetchOnFocus: true },
  );

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toggling, setToggling] = useState(false);

  const targetActive = data ? !data.sales.is_active : true;

  const handleToggleActive = () => {
    if (!data || toggling) {
      return;
    }
    setToggling(true);
    setSalesActive(salesId, targetActive)
      .then(() => {
        toast.success(
          targetActive ? 'Sales berhasil diaktifkan.' : 'Sales berhasil dinonaktifkan.',
        );
        setConfirmVisible(false);
        return reload();
      })
      .catch((caught: unknown) => {
        toast.error(getUserMessage(caught));
        setConfirmVisible(false);
      })
      .finally(() => setToggling(false));
  };

  if (loading) {
    return <Loading variant="fullscreen" />;
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => void reload()} />
      </Screen>
    );
  }

  if (!data) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detail Sales' }} />
        <Screen scroll={false}>
          <EmptyState
            action={{ label: 'Kembali', onPress: () => router.replace('/admin/sales') }}
            description="Data sales tidak ditemukan atau sudah dihapus."
            title="Sales tidak ditemukan"
          />
        </Screen>
      </>
    );
  }

  const { sales, invoices } = data;
  const countByStatus = (status: InvoiceStatus) =>
    invoices.filter((invoice) => invoice.status === status).length;

  return (
    <>
      <Stack.Screen options={{ title: 'Detail Sales' }} />
      <Screen>
        <Card>
          <DetailRow label="Nama Sales" value={sales.name} />
          <DetailRow label="Nomor Telepon" value={sales.phone} />
          <DetailRow label="Status" value={sales.is_active ? 'Aktif' : 'Tidak Aktif'} />
        </Card>

        <Button
          disabled={toggling}
          onPress={() => setConfirmVisible(true)}
          title={sales.is_active ? 'Nonaktifkan Sales' : 'Aktifkan Sales'}
          variant={sales.is_active ? 'danger' : 'primary'}
        />

        <ConfirmDialog
          confirmLabel={targetActive ? 'Aktifkan' : 'Nonaktifkan'}
          destructive={data.sales.is_active}
          loading={toggling}
          message={
            targetActive
              ? `${sales.name} akan menerima assignment invoice baru lagi.`
              : `${sales.name} tidak dapat menerima assignment invoice baru. Data invoice historical tetap tersimpan.`
          }
          onCancel={() => {
            if (!toggling) {
              setConfirmVisible(false);
            }
          }}
          onConfirm={handleToggleActive}
          title={targetActive ? 'Aktifkan Sales?' : 'Nonaktifkan Sales?'}
          visible={confirmVisible}
        />

        <Card>
          <DetailRow label={`Total Invoice: ${invoices.length}`} value={null} />
          <DetailRow label={`Belum Ditagih: ${countByStatus('belum_ditagih')}`} value={null} />
          <DetailRow label={`Sudah Ditagih: ${countByStatus('sudah_ditagih')}`} value={null} />
          <DetailRow label={`Dibayar: ${countByStatus('dibayar')}`} value={null} />
        </Card>

        <Card>
          <DetailRow label={`Invoice Ditugaskan (${invoices.length})`} value={null} />
          {invoices.length === 0 ? (
            <EmptyState description="Belum ada invoice untuk sales ini." title="Belum ada invoice" />
          ) : (
            invoices.map((invoice) => (
              <InvoiceListItem
                invoice={invoice}
                key={invoice.id}
                onPress={() => router.push(`/admin/invoices/${invoice.id}`)}
              />
            ))
          )}
        </Card>
      </Screen>
    </>
  );
}
