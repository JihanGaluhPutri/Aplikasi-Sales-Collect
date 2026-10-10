import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { INVOICE_STATUS_META } from '@/constants/status';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getInvoiceHistory } from '@/services/invoiceService';
import { formatDateTime } from '@/utils/date';

export interface InvoiceStatusHistoryProps {
  invoiceId: string;
}

/**
 * Riwayat status invoice (TB-64): old_status -> new_status, pelaku,
 * dan timestamp. Sales hanya melihat history invoice miliknya (RLS);
 * admin melihat history invoice sesuai permission.
 *
 * History tidak dapat diedit/dihapus dari client - hanya ditulis
 * oleh RPC `update_invoice_status`.
 */
export function InvoiceStatusHistory({ invoiceId }: InvoiceStatusHistoryProps) {
  const { data, loading, error, reload } = useAsync(
    () => getInvoiceHistory(invoiceId),
    [invoiceId],
    { refetchOnFocus: true },
  );

  const items = data ?? [];

  return (
    <Card>
      <Text style={styles.heading}>Riwayat Status</Text>

      {loading ? (
        <Loading message="Memuat riwayat..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : items.length === 0 ? (
        <EmptyState description="Belum ada perubahan status pada invoice ini." title="Belum ada riwayat" />
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.transition}>
              {item.old_status ? INVOICE_STATUS_META[item.old_status].label : 'Dibuat'} →{' '}
              {INVOICE_STATUS_META[item.new_status].label}
            </Text>
            <Text style={styles.meta}>
              {item.changedByName ?? 'Sistem'} · {formatDateTime(item.changed_at)}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  item: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingVertical: spacing.sm,
  },
  transition: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
});
