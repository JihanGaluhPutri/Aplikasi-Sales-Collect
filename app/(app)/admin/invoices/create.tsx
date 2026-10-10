import { router, Stack } from 'expo-router';

import { InvoiceForm } from '@/components/InvoiceForm';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { createInvoice } from '@/services/invoiceService';
import type { InvoiceInput } from '@/types/invoice';

/**
 * Tambah invoice (TB-53): validation -> create -> status default
 * `belum_ditagih` (ditentukan database) -> buka detail invoice baru.
 */
export default function CreateInvoiceScreen() {
  const toast = useToast();

  const handleSubmit = async (input: InvoiceInput) => {
    const created = await createInvoice(input);
    toast.success('Invoice berhasil ditambahkan.');
    router.replace(`/admin/invoices/${created.id}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tambah Invoice' }} />
      <Screen>
        <InvoiceForm onSubmit={handleSubmit} submitLabel="Simpan Invoice" />
      </Screen>
    </>
  );
}
