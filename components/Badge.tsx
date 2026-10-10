import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}

const toneColors: Record<BadgeTone, { background: string; text: string }> = {
  primary: { background: 'rgba(37, 99, 235, 0.12)', text: colors.primaryDark },
  success: { background: 'rgba(22, 163, 74, 0.12)', text: colors.success },
  warning: { background: 'rgba(245, 158, 11, 0.16)', text: '#B45309' },
  danger: { background: 'rgba(220, 38, 38, 0.12)', text: colors.danger },
  secondary: { background: 'rgba(100, 116, 139, 0.14)', text: colors.secondary },
};

export function Badge({ label, tone = 'primary', style }: BadgeProps) {
  const palette = toneColors[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }, style]}>
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
