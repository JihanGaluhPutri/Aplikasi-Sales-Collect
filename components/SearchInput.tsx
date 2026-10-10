import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';

export interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

/**
 * Field pencarian (TB-51) dengan tombol hapus.
 * Pencarian dilakukan terhadap data yang memang boleh diakses user -
 * filter RLS tetap berlaku di database.
 */
export function SearchInput({ value, onChangeText, placeholder = 'Cari...' }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Hapus pencarian"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Text style={styles.clearGlyph}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xl + spacing.sm,
  },
  clear: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    width: 36,
  },
  clearGlyph: {
    color: colors.secondary,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
});
