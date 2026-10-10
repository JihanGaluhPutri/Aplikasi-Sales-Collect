import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface MenuLinkProps {
  title: string;
  description?: string;
  onPress: () => void;
  /** Konten opsional di sebelah kanan (mis. status badge). */
  trailing?: ReactNode;
}

/**
 * Item menu role-based (TB-69). Menyembunyikan menu hanyalah UX -
 * akses sebenarnya dilindungi route guard + Supabase RLS.
 */
export function MenuLink({ title, description, onPress, trailing }: MenuLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {trailing}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  description: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
  chevron: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});
