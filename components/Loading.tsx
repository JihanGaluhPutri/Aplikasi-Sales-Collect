import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

export interface LoadingProps {
  message?: string;
  variant?: 'fullscreen' | 'inline';
  size?: 'small' | 'large';
}

/**
 * Loading reusable untuk page loading maupun data fetching.
 * Gunakan `variant="fullscreen"` saat seluruh layar sedang dimuat,
 * dan `variant="inline"` untuk area/list yang sedang dimuat.
 */
export function Loading({
  message = 'Memuat...',
  variant = 'inline',
  size = 'large',
}: LoadingProps) {
  const content = (
    <View style={styles.content}>
      <ActivityIndicator color={colors.primary} size={size} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  if (variant === 'fullscreen') {
    return <View style={styles.fullscreen}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  fullscreen: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    flex: 1,
  },
  message: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
