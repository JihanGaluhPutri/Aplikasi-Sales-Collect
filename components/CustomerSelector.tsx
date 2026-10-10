import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionPicker } from '@/components/OptionPicker';
import { SearchInput } from '@/components/SearchInput';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { searchCustomers } from '@/services/customerService';
import type { Customer } from '@/types/customer';
import { getUserMessage } from '@/utils/error';

export interface CustomerSelectorProps {
  value: Customer | null;
  onSelect: (customer: Customer) => void;
  label?: string;
  error?: string | null;
}

/**
 * Pemilih customer untuk form invoice (TB-53): tampil nama customer
 * terpilih dan membuka sheet pencarian customer (dengan state
 * loading / error / empty).
 */
export function CustomerSelector({
  value,
  onSelect,
  label = 'Customer*',
  error,
}: CustomerSelectorProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Customer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await searchCustomers(term);
      setOptions(result);
    } catch (caught) {
      setOptions(null);
      setLoadError(getUserMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const timeout = setTimeout(() => {
      void load(query);
    }, 250);
    return () => clearTimeout(timeout);
  }, [visible, query, load]);

  const handleOpen = () => {
    setQuery('');
    setOptions(null);
    setLoadError(null);
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={handleOpen}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ? `${value.name}${value.phone ? ` · ${value.phone}` : ''}` : 'Pilih customer'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <OptionPicker
        emptyText="Customer tidak ditemukan. Tambahkan customer terlebih dahulu."
        error={loadError}
        headerContent={
          <SearchInput onChangeText={setQuery} placeholder="Cari nama customer..." value={query} />
        }
        loading={loading}
        onClose={() => setVisible(false)}
        onSelect={(customerId) => {
          const matched = (options ?? []).find((customer) => customer.id === customerId);
          if (matched) {
            onSelect(matched);
          }
        }}
        onRetry={() => void load(query)}
        options={(options ?? []).map((customer) => ({
          label: customer.name,
          value: customer.id,
          hint: customer.phone ?? undefined,
        }))}
        selectedValue={value?.id ?? null}
        title="Pilih Customer"
        visible={visible}
      />
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
  field: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  value: {
    color: colors.text,
    flex: 1,
    fontSize: fontSize.md,
  },
  placeholder: {
    color: colors.secondary,
  },
  chevron: {
    color: colors.secondary,
    fontSize: fontSize.md,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});
