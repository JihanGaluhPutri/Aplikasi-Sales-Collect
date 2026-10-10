import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

export interface ScreenPlaceholderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

const DEFAULT_DESCRIPTION =
  'Route ini sudah disiapkan sebagai bagian dari struktur navigasi. ' +
  'Implementasi halaman mengikuti SalesCollect-Technical-Backlog.md.';

/**
 * Placeholder untuk route yang belum diimplementasikan.
 * Menjaga struktur route tetap lengkap tanpa menambah fitur di luar scope.
 */
export function ScreenPlaceholder({ title, description, children }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description ?? DEFAULT_DESCRIPTION}</Text>
        {children}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  description: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
});
