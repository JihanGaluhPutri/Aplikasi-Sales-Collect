import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { MenuLink } from '@/components/MenuLink';
import { Screen } from '@/components/Screen';
import { SearchInput } from '@/components/SearchInput';
import { colors, radius, spacing } from '@/constants/theme';
import { getCustomers, searchCustomers } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import { useAsync } from '@/hooks/useAsync';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Customer list (TB-39): admin melihat semua customer dengan search,
 * plus loading / empty / error state.
 */
export default function CustomerListScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data, loading, error, reload } = useAsync<Customer[]>(
    () => (debouncedQuery.trim() ? searchCustomers(debouncedQuery) : getCustomers()),
    [debouncedQuery],
    { refetchOnFocus: true },
  );

  const customers = data ?? [];
  const showEmptyAfterSearch =
    !loading && !error && customers.length === 0 && debouncedQuery.trim().length > 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Customers' }} />
      <Screen scroll={false}>
        <Button onPress={() => router.push('/admin/customers/create')} title="Tambah Customer" />
        <SearchInput onChangeText={setQuery} placeholder="Cari customer..." value={query} />

        {loading ? (
          <Loading message="Memuat customer..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload()} />
        ) : customers.length === 0 ? (
          showEmptyAfterSearch ? (
            <EmptyState
              action={{ label: 'Bersihkan Pencarian', onPress: () => setQuery('') }}
              description={`Tidak ada customer yang cocok dengan "${debouncedQuery}".`}
              title="Hasil tidak ditemukan"
            />
          ) : (
            <EmptyState
              action={{ label: 'Tambah Customer', onPress: () => router.push('/admin/customers/create') }}
              description="Belum ada customer. Tambahkan customer untuk memulai."
              title="Belum ada customer"
            />
          )
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={customers}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(customer) => customer.id}
            renderItem={({ item: customer }) => (
              <MenuLink
                description={[customer.owner_name, customer.phone].filter(Boolean).join(' · ')}
                onPress={() => router.push(`/admin/customers/${customer.id}`)}
                title={customer.name}
              />
            )}
            style={styles.list}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
