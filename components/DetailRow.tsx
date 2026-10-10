import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

export interface DetailRowProps {
  label: string;
  value?: string | number | null;
  /** Nilai placeholder ketika value kosong. */
  emptyText?: string;
}

/** Baris label-value untuk halaman detail (customer, invoice, sales, profile). */
export function DetailRow({ label, value, emptyText = '-' }: DetailRowProps) {
  const displayValue = value === null || value === undefined || value === '' ? emptyText : value;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
