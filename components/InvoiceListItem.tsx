import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import type { InvoiceSummary } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

export interface InvoiceListItemProps {
  invoice: InvoiceSummary;
  onPress: () => void;
  /** Tampilkan kolom sales (list admin) - disembunyikan di My Invoice. */
  showSales?: boolean;
}

/**
 * Item list invoice (TB-50, TB-59): nomor, customer, amount, due date,
 * status badge, dan sales (opsional).
 */
export function InvoiceListItem({ invoice, onPress, showSales = true }: InvoiceListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.number}>{invoice.invoice_number}</Text>
        <StatusBadge status={invoice.status} />
      </View>

      <Text style={styles.customer} numberOfLines={1}>
        {invoice.customerName ?? 'Customer tidak tersedia'}
      </Text>

      {showSales ? (
        <Text style={styles.sales} numberOfLines={1}>
          Sales: {invoice.salesName ?? 'Belum ditugaskan'}
        </Text>
      ) : null}

      <View style={styles.bottomRow}>
        <Text style={styles.amount}>{formatCurrency(invoice.amount)}</Text>
        <Text style={styles.due}>Jatuh tempo {formatDate(invoice.due_date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  number: {
    color: colors.text,
    flexShrink: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  customer: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  sales: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  amount: {
    color: colors.primaryDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  due: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
});
