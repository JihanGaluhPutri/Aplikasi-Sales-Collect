import { RefObject } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { validateDateRange, validateISODate } from '@/utils/validation';

export interface DateRangeFilterProps {
  /** `YYYY-MM-DD` */
  startDate: string;
  /** `YYYY-MM-DD` */
  endDate: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  /** Dipanggil HANYA ketika rentang valid (TB-80: query tidak jalan bila invalid). */
  onApply?: () => void;
  applyLabel?: string;
  /** True selama data periode sedang dimuat -> tombol Terapkan ikut loading & disabled (TB-86). */
  applying?: boolean;
  /** Ref input tanggal mulai agar elemen lain (mis. CTA) bisa focus ke sini. */
  startInputRef?: RefObject<TextInput | null>;
}

/**
 * Filter periode laporan (TB-80) - reusable untuk Collection Report (TB-78)
 * dan Report by Sales (TB-79).
 *
 * Validasi:
 * - format per-field (YYYY-MM-DD) via `validateISODate`
 * - urutan tanggal via `validateDateRange` -> pesan
 *   "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
 * Tombol Terapkan dinonaktifkan selama rentang masih invalid.
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  onApply,
  applyLabel = 'Terapkan Periode',
  applying = false,
  startInputRef,
}: DateRangeFilterProps) {
  const startError = validateISODate(startDate);
  const endError = validateISODate(endDate);
  const orderError = validateDateRange(startDate, endDate);
  const hasError = Boolean(startError || endError || orderError);

  return (
    <Card>
      <Text style={styles.heading}>Filter Periode</Text>

      <View style={styles.row}>
        <Input
          error={startError}
          keyboardType="numbers-and-punctuation"
          label="Tanggal Mulai"
          maxLength={10}
          onChangeText={onChangeStart}
          placeholder="YYYY-MM-DD"
          style={styles.field}
          textInputRef={startInputRef}
          value={startDate}
        />
        <Input
          error={endError}
          keyboardType="numbers-and-punctuation"
          label="Tanggal Akhir"
          maxLength={10}
          onChangeText={onChangeEnd}
          placeholder="YYYY-MM-DD"
          style={styles.field}
          value={endDate}
        />
      </View>

      {orderError ? <Text style={styles.orderError}>{orderError}</Text> : null}

      {onApply ? (
        <Button
          disabled={hasError}
          loading={applying}
          onPress={onApply}
          title={applyLabel}
          variant="secondary"
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  field: {
    flexGrow: 1,
    minWidth: 140,
  },
  orderError: {
    color: colors.danger,
    fontSize: fontSize.xs,
  },
});
