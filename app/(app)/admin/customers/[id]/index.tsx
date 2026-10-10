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
import {
  deleteCustomer,
  getCustomerById,
} from '@/services/customerService';
import { countInvoicesByCustomerId, getInvoices } from '@/services/invoiceService';
import type { Customer } from '@/types/customer';
import type { InvoiceSummary } from '@/types/invoice';
import { getUserMessage } from '@/utils/error';

interface CustomerDetailData {
  customer: Customer;
  invoices: InvoiceSummary[];
}

/**
 * Detail customer (TB-41): data utama + invoice terkait (TB-65),
 * aksi edit/hapus (TB-42, TB-43).
 *
 * Hapus dicek dulu: customer yang masih punya invoice tidak dihapus
 * (ON DELETE RESTRICT di database juga menolaknya - tidak ada orphan).
 */
export default function CustomerDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = id ?? '';

  const { data, loading, error, reload } = useAsync<CustomerDetailData | null>(
    async () => {
      const customer = await getCustomerById(customerId);
      if (!customer) {
        return null;
      }
      const invoices = await getInvoices({ customerId });
      return { customer, invoices };
    },
    [customerId],
    { refetchOnFocus: true },
  );

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    void (async () => {
      try {
        const invoiceCount = await countInvoicesByCustomerId(customerId);
        if (invoiceCount > 0) {
          toast.error(
            `Customer masih memiliki ${invoiceCount} invoice dan tidak dapat dihapus.`,
          );
          setConfirmVisible(false);
          return;
        }
        await deleteCustomer(customerId);
        toast.success('Customer berhasil dihapus.');
        router.replace('/admin/customers');
      } catch (caught) {
        toast.error(getUserMessage(caught));
        setConfirmVisible(false);
      } finally {
        setDeleting(false);
      }
    })();
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
        <Stack.Screen options={{ title: 'Detail Customer' }} />
        <Screen scroll={false}>
          <EmptyState
            action={{ label: 'Kembali', onPress: () => router.replace('/admin/customers') }}
            description="Customer tidak ditemukan atau sudah dihapus."
            title="Customer tidak ditemukan"
          />
        </Screen>
      </>
    );
  }

  const { customer, invoices } = data;

  return (
    <>
      <Stack.Screen options={{ title: 'Detail Customer' }} />
      <Screen>
        <Card>
          <DetailRow label="Nama Customer" value={customer.name} />
          <DetailRow label="Nama Pemilik" value={customer.owner_name} />
          <DetailRow label="Nomor Telepon" value={customer.phone} />
          <DetailRow label="Alamat" value={customer.address} />
        </Card>

        <Button
          onPress={() => router.push(`/admin/customers/${customer.id}/edit`)}
          title="Edit Customer"
        />
        <Button
          disabled={deleting}
          onPress={() => setConfirmVisible(true)}
          title="Hapus Customer"
          variant="danger"
        />

        <ConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Hapus"
          destructive
          loading={deleting}
          message={`Customer ${customer.name} akan dihapus. Customer yang masih memiliki invoice tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan.`}
          onCancel={() => {
            if (!deleting) {
              setConfirmVisible(false);
            }
          }}
          onConfirm={handleDelete}
          title="Hapus Customer?"
          visible={confirmVisible}
        />

        <Card>
          <DetailRow label={`Invoice Terkait (${invoices.length})`} value={null} />
          {invoices.length === 0 ? (
            <EmptyState
              description="Customer ini belum memiliki invoice."
              title="Belum ada invoice"
            />
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
