import { router, Stack, useLocalSearchParams } from 'expo-router';

import { CustomerForm } from '@/components/CustomerForm';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { useAsync } from '@/hooks/useAsync';
import { getCustomerById, updateCustomer } from '@/services/customerService';
import type { Customer, CustomerInput } from '@/types/customer';
import { goBackOrReplace } from '@/utils/navigation';

/**
 * Edit customer (TB-42): load data -> tampilkan data terbaru -> edit
 * -> validation -> update -> kembali ke detail.
 */
export default function EditCustomerScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = id ?? '';

  const { data: customer, loading, error, reload } = useAsync<Customer | null>(
    () => getCustomerById(customerId),
    [customerId],
    { refetchOnFocus: true },
  );

  const handleSubmit = async (input: CustomerInput) => {
    await updateCustomer(customerId, input);
    toast.success('Customer berhasil diperbarui.');
    // Kembali ke detail; fallback ke list bila masuk lewat deep link (TB-84).
    goBackOrReplace('/admin/customers');
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

  if (!customer) {
    return (
      <Screen>
        <ErrorState
          message="Customer tidak ditemukan atau sudah dihapus."
          onRetry={() => router.replace('/admin/customers')}
          retryLabel="Kembali ke List"
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Customer' }} />
      <Screen>
        <CustomerForm initialValue={customer} onSubmit={handleSubmit} submitLabel="Simpan Perubahan" />
      </Screen>
    </>
  );
}
