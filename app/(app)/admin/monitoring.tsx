import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceListItem } from '@/components/InvoiceListItem';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { SearchInput } from '@/components/SearchInput';
import { StatusFilterChips } from '@/components/StatusFilterChips';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getInvoices } from '@/services/invoiceService';
import type { InvoiceQueryOptions, InvoiceStatus, InvoiceSummary } from '@/types/invoice';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Collection Monitoring admin (TB-77).
 *
 * Menampilkan fakta invoice: nomor, customer, sales penanggung jawab,
 * amount, jatuh tempo, dan status - dengan search + filter status.
 * Murni data faktual: TIDAK ada ranking, top sales, scoring, atau
 * penilaian performa. Query tetap mengikuti RLS.
 */
export default function AdminMonitoringScreen() {
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
      <Stack.Screen options={{ title: 'Monitoring' }} />
      <Screen scroll={false}>
        <Text style={styles.intro}>
          Pantau kondisi collection: invoice mana yang belum ditagih, sudah ditagih, sudah
          dibayar, dan sales mana yang menanganinya.
        </Text>

        <SearchInput
          onChangeText={setQuery}
          placeholder="Cari nomor invoice atau customer..."
          value={query}
        />
        <StatusFilterChips onChange={setStatus} value={status} />

        {loading ? (
          <Loading message="Memuat monitoring..." />
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
              action={{
                label: 'Tambah Invoice',
                onPress: () => router.push('/admin/invoices/create'),
              }}
              description="Belum ada invoice untuk dipantau."
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
  intro: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
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
