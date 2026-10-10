import { router, Stack, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/ErrorState';
import { InvoiceForm } from '@/components/InvoiceForm';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { useAsync } from '@/hooks/useAsync';
import { getInvoiceById, updateInvoice } from '@/services/invoiceService';
import type { InvoiceDetail, InvoiceInput } from '@/types/invoice';
import { goBackOrReplace } from '@/utils/navigation';

/**
 * Edit invoice (TB-55).
 *
 * Field status TIDAK ada di form - status collection diubah hanya melalui
 * flow status khusus supaya history terkontrol (TB-61, TB-63).
 * Nomor invoice tetap divalidasi unique oleh constraint database.
 */
export default function EditInvoiceScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = id ?? '';

  const { data: invoice, loading, error, reload } = useAsync<InvoiceDetail | null>(
    () => getInvoiceById(invoiceId),
    [invoiceId],
    { refetchOnFocus: true },
  );

  const handleSubmit = async (input: InvoiceInput) => {
    await updateInvoice(invoiceId, input);
    toast.success('Invoice berhasil diperbarui.');
    // Kembali ke detail; fallback ke list bila masuk lewat deep link (TB-84).
    goBackOrReplace('/admin/invoices');
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

  if (!invoice) {
    return (
      <Screen>
        <ErrorState
          message="Invoice tidak ditemukan atau sudah dihapus."
          onRetry={() => router.replace('/admin/invoices')}
          retryLabel="Kembali ke List"
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Invoice' }} />
      <Screen>
        <InvoiceForm initialValue={invoice} onSubmit={handleSubmit} submitLabel="Simpan Perubahan" />
      </Screen>
    </>
  );
}
