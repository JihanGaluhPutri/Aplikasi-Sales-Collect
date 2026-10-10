import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceListItem } from '@/components/InvoiceListItem';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { SearchInput } from '@/components/SearchInput';
import { StatusFilterChips } from '@/components/StatusFilterChips';
import { colors, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getInvoices } from '@/services/invoiceService';
import type { InvoiceQueryOptions, InvoiceStatus, InvoiceSummary } from '@/types/invoice';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Invoice list admin (TB-50) + search (TB-51) + filter status (TB-52).
 * Query tetap mengikuti RLS di database - search tidak mengubah authorization.
 */
export default function AdminInvoiceListScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const options: InvoiceQueryOptions = { search: debouncedQuery, status };
  const { data, loading, error, reload } = useAsync<InvoiceSummary[]>(
    () => getInvoices(options),
    [debouncedQuery, status],
    { refetchOnFocus: true },
  );

  const invoices = data ?? [];
  const hasFilter = debouncedQuery.trim().length > 0 || status !== null;

  return (
    <>
      <Stack.Screen options={{ title: 'Invoices' }} />
      <Screen scroll={false}>
        <Button onPress={() => router.push('/admin/invoices/create')} title="Tambah Invoice" />
        <SearchInput onChangeText={setQuery} placeholder="Cari nomor invoice atau customer..." value={query} />
        <StatusFilterChips onChange={setStatus} value={status} />

        {loading ? (
          <Loading message="Memuat invoice..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload()} />
        ) : invoices.length === 0 ? (
          hasFilter ? (
            <EmptyState
              action={{
                label: 'Bersihkan Filter',
                onPress: () => {
                  setQuery('');
                  setStatus(null);
                },
              }}
              description="Tidak ada invoice yang cocok dengan pencarian/filter saat ini."
              title="Hasil tidak ditemukan"
            />
          ) : (
            <EmptyState
              action={{ label: 'Tambah Invoice', onPress: () => router.push('/admin/invoices/create') }}
              description="Belum ada invoice. Buat invoice pertama untuk memulai."
              title="Belum ada invoice"
            />
          )
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={invoices}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(invoice) => invoice.id}
            renderItem={({ item: invoice }) => (
              <InvoiceListItem
                invoice={invoice}
                onPress={() => router.push(`/admin/invoices/${invoice.id}`)}
                showSales
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
