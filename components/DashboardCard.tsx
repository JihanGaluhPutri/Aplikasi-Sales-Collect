import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

export type DashboardCardVariant = 'default' | 'success' | 'warning' | 'info';

export interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: DashboardCardVariant;
  /** true saat data sedang dimuat - tampilkan spinner, bukan angka 0. */
  loading?: boolean;
}

const accentByVariant: Record<DashboardCardVariant, string> = {
  default: colors.primary,
  info: colors.primaryDark,
  warning: colors.warning,
  success: colors.success,
};

/**
 * Card ringkasan dashboard (TB-75) - satu component yang sama dipakai
 * oleh Admin Dashboard (TB-72) dan Sales Dashboard (TB-74).
 * Angka selalu dikirim dari service (database), tidak ada hardcoded.
 */
export function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
  loading = false,
}: DashboardCardProps) {
  return (
    <Card style={[styles.card, { borderLeftColor: accentByVariant[variant] }]}>
      <View style={styles.header}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={styles.title}>{title}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}

      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  icon: {
    justifyContent: 'center',
  },
  title: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  description: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
});
