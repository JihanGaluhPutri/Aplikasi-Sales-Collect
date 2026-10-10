import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Loading } from '@/components/Loading';
import { OptionPicker, PickerOption } from '@/components/OptionPicker';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { getSales } from '@/services/salesService';
import type { Sales } from '@/types/sales';
import { useAsync } from '@/hooks/useAsync';

export interface SalesSelectorProps {
  /** Id sales terpilih (null = invoice belum ditugaskan). */
  value: string | null;
  onChange: (salesId: string | null) => void;
  label?: string;
  /** Tampilkan opsi "Belum ditugaskan" untuk melepas assignment. */
  allowClear?: boolean;
  error?: string | null;
}

/**
 * Pemilih sales untuk assignment invoice (TB-57, TB-58).
 *
 * - Hanya sales AKTIF yang muncul sebagai pilihan assignment baru.
 * - Sales yang sedang terpilih tetap ditampilkan meski sudah nonaktif
 *   (historical invoice harus tetap terbaca).
 * - States: loading, loaded, empty ("Belum ada sales aktif..."), error.
 */
export function SalesSelector({
  value,
  onChange,
  label = 'Sales',
  allowClear = false,
  error,
}: SalesSelectorProps) {
  const [visible, setVisible] = useState(false);
  const { data: sales, loading, error: loadError, reload } = useAsync<Sales[]>(
    () => getSales(),
    [],
    { refetchOnFocus: false },
  );

  const rows = useMemo(() => sales ?? [], [sales]);
  const selectedSales = useMemo(
    () => rows.find((row) => row.id === value) ?? null,
    [rows, value],
  );

  const activeRows = useMemo(() => rows.filter((row) => row.is_active), [rows]);

  const options = useMemo<PickerOption<string | null>[]>(() => {
    const list: PickerOption<string | null>[] = activeRows.map((row) => ({
      label: row.name,
      value: row.id,
      hint: row.phone ?? 'Aktif',
    }));

    // Sales terpilih yang nonaktif tetap harus tampil agar pilihan saat ini
    // tidak hilang dari sheet.
    if (value && !activeRows.some((row) => row.id === value)) {
      list.unshift({
        label: selectedSales?.name ?? 'Sales terpilih',
        value,
        hint: 'Tidak aktif - tidak dapat menerima invoice baru',
      });
    }

    if (allowClear) {
      list.push({ label: 'Belum ditugaskan', value: null });
    }

    return list;
  }, [activeRows, allowClear, selectedSales, value]);

  const showEmptyState = !loading && !loadError && activeRows.length === 0 && !value;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {loading ? (
        <Loading message="Memuat sales..." />
      ) : loadError ? (
        <View style={[styles.field, styles.stateBox]}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable accessibilityRole="button" onPress={() => void reload()}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : showEmptyState ? (
        <View style={[styles.field, styles.stateBox]}>
          <Text style={styles.emptyText}>Belum ada sales aktif. Tambahkan sales terlebih dahulu.</Text>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setVisible(true)}
          style={[styles.field, error ? styles.fieldError : null]}
        >
          <View style={styles.valueGroup}>
            <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
              {value ? (selectedSales?.name ?? 'Sales terpilih') : 'Pilih sales'}
            </Text>
            {value && selectedSales ? (
              <Badge
                label={selectedSales.is_active ? 'Aktif' : 'Tidak Aktif'}
                tone={selectedSales.is_active ? 'success' : 'secondary'}
              />
            ) : null}
          </View>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <OptionPicker
        emptyText="Belum ada sales aktif. Tambahkan sales terlebih dahulu."
        loading={false}
        onClose={() => setVisible(false)}
        onSelect={onChange}
        options={options}
        selectedValue={value}
        title="Pilih Sales"
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
  valueGroup: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  value: {
    color: colors.text,
    flexShrink: 1,
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
  stateBox: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 56,
  },
  emptyText: {
    color: colors.secondary,
    flex: 1,
    fontSize: fontSize.sm,
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: fontSize.sm,
  },
  retryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
