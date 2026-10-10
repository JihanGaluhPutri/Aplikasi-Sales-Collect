import { RefObject, useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  /** Batas karakter (TB-88) - mencegah input melebihi panjang yang diizinkan. */
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
  /** Ref ke TextInput (mis. agar tombol lain bisa focus ke input ini). */
  textInputRef?: RefObject<TextInput | null>;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  editable = true,
  multiline = false,
  maxLength,
  style,
  textInputRef,
}: InputProps) {
  const [isFocused, setFocused] = useState(false);
  // Visibility toggle per-field (UX enhancement): state disembunyikan lokal
  // di setiap instance Input sehingga Login/Register tidak saling mempengaruhi.
  const [revealed, setRevealed] = useState(false);
  const hasError = Boolean(error);
  const showToggle = secureTextEntry && !multiline;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.secondary}
          ref={textInputRef}
          secureTextEntry={secureTextEntry && !revealed}
          style={[
            styles.input,
            multiline && styles.multiline,
            isFocused && styles.focused,
            hasError && styles.inputError,
            !editable && styles.disabled,
            showToggle && styles.inputWithToggle,
          ]}
          value={value}
        />
        {showToggle ? (
          <Pressable
            accessibilityLabel={revealed ? 'Sembunyikan password' : 'Tampilkan password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setRevealed((current) => !current)}
            style={styles.toggle}
          >
            <Ionicons
              color={colors.secondary}
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {hasError ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
  },
  inputWithToggle: {
    paddingRight: spacing.xl + spacing.lg,
  },
  toggle: {
    position: 'absolute',
    right: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  disabled: {
    backgroundColor: colors.background,
    color: colors.secondary,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});
