import { router, Stack } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceListItem } from '@/components/InvoiceListItem';
import { Loading } from '@/components/Loading';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getMyInvoices } from '@/services/invoiceService';
import type { InvoiceSummary } from '@/types/invoice';

/**
 * My Invoice (TB-59): hanya invoice dengan `sales_id` sales yang login.
 *
 * Filter ownership dilakukan di query service DAN di Supabase RLS -
 * sales lain tidak bisa diambil lewat ID langsung maupun lewat UI.
 */
export default function MyInvoiceListScreen() {
  const { data, loading, error, reload } = useAsync<InvoiceSummary[]>(
    () => getMyInvoices(),
    [],
    { refetchOnFocus: true },
  );

  const invoices = data ?? [];

  return (
    <>
      <Stack.Screen options={{ title: 'My Invoices' }} />
      <Screen scroll={false}>
        {loading ? (
          <Loading message="Memuat invoice Anda..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload()} />
        ) : invoices.length === 0 ? (
          <EmptyState
            description="Belum ada invoice yang ditugaskan kepada Anda. Hubungi admin jika menurut Anda ini keliru."
            title="Belum ada invoice"
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={invoices}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(invoice) => invoice.id}
            renderItem={({ item: invoice }) => (
              <InvoiceListItem
                invoice={invoice}
                onPress={() => router.push(`/sales/invoices/${invoice.id}`)}
                showSales={false}
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
