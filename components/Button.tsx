import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const backgroundByVariant: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.card,
  danger: colors.danger,
};

const labelByVariant: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.primary,
  danger: colors.white,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const labelColor = variant === 'secondary' ? colors.primary : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgroundByVariant[variant] },
        variant === 'secondary' && styles.secondaryBorder,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            { color: labelByVariant[variant] },
            isDisabled && styles.disabledLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: colors.border,
  },
  disabledLabel: {
    color: colors.secondary,
  },
});
