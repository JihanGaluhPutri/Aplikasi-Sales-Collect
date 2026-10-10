import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Error state untuk gagal memuat data / gagal operasi.
 * Berbeda dengan EmptyState: kondisi ini berarti terjadi kesalahan,
 * bukan tidak ada data.
 */
export function ErrorState({
  message = 'Terjadi kesalahan. Silakan coba lagi.',
  onRetry,
  retryLabel = 'Coba Lagi',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button onPress={onRetry} style={styles.action} title={retryLabel} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: colors.danger,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  iconText: {
    color: colors.danger,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  message: {
    color: colors.text,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 200,
  },
});
