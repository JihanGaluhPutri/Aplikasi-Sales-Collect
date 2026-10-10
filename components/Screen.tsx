import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colors, spacing } from '@/constants/theme';

export interface ScreenProps {
  children: ReactNode;
  /** Aktifkan ScrollView untuk layar yang kontennya bisa melebihi layar (default true). */
  scroll?: boolean;
  /** Elemen yang selalu menempel di bawah (mis. tombol submit). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapper standar seluruh layar: safe padding, keyboard avoidance,
 * dan layout konsisten sehingga screen hanya berisi konten bisnisnya.
 */
export function Screen({ children, scroll = true, footer, contentStyle, style }: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, style]}
    >
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  flex: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  footer: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
