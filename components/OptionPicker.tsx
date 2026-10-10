import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Loading } from '@/components/Loading';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface PickerOption<T> {
  label: string;
  value: T;
  hint?: string;
}

export interface OptionPickerProps<T> {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyText?: string;
  /** Konten opsional di bawah header (mis. field pencarian). */
  headerContent?: ReactNode;
}

/**
 * Sheet pemilihan opsi generik (customer, sales, dsb.) dengan state
 * loading, error, dan empty - dipakai oleh CustomerSelector/SalesSelector.
 */
export function OptionPicker<T>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  loading = false,
  error = null,
  onRetry,
  emptyText = 'Tidak ada pilihan tersedia.',
  headerContent,
}: OptionPickerProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityLabel="Tutup" accessibilityRole="button" hitSlop={8} onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          {headerContent ? <View style={styles.headerContent}>{headerContent}</View> : null}

          {loading ? (
            <Loading message="Memuat pilihan..." />
          ) : error ? (
            <View style={styles.stateBox}>
              <Text style={styles.errorText}>{error}</Text>
              {onRetry ? (
                <Pressable accessibilityRole="button" onPress={onRetry}>
                  <Text style={styles.retryText}>Coba Lagi</Text>
                </Pressable>
              ) : null}
            </View>
          ) : options.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {options.map((option, index) => {
                const isSelected =
                  selectedValue !== null && option.value === selectedValue;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={`${String(option.value)}-${index}`}
                    onPress={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
                    </View>
                    {isSelected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    maxHeight: '80%',
    minHeight: 240,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  close: {
    color: colors.secondary,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl + 6,
  },
  headerContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  list: {
    padding: spacing.sm,
  },
  option: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionPressed: {
    backgroundColor: colors.background,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  optionHint: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  check: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  stateBox: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
