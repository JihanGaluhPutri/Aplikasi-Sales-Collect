import { router, Stack } from 'expo-router';

import { CustomerForm } from '@/components/CustomerForm';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { createCustomer } from '@/services/customerService';
import type { CustomerInput } from '@/types/customer';

/**
 * Tambah customer (TB-40): form -> validation -> service -> INSERT
 * (dilindungi RLS admin) -> sukses -> kembali ke list.
 */
export default function CreateCustomerScreen() {
  const toast = useToast();

  const handleSubmit = async (input: CustomerInput) => {
    await createCustomer(input);
    toast.success('Customer berhasil ditambahkan.');
    router.replace('/admin/customers');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tambah Customer' }} />
      <Screen>
        <CustomerForm onSubmit={handleSubmit} submitLabel="Simpan Customer" />
      </Screen>
    </>
  );
}
