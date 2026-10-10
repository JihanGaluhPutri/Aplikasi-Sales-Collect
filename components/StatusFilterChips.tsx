import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { INVOICE_STATUS_FILTER_OPTIONS } from '@/constants/status';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import type { InvoiceStatus } from '@/types/invoice';

export interface StatusFilterChipsProps {
  value: InvoiceStatus | null;
  onChange: (value: InvoiceStatus | null) => void;
}

/**
 * Filter status list invoice (TB-52): Semua, Belum Ditagih,
 * Sudah Ditagih, Dibayar. Bisa dikombinasikan dengan search.
 *
 * UX enhancement: segmented control horizontal yang compact dalam SATU
 * baris (track abu-abu, segmen aktif `#2563EB`) alih-alih kapsul vertikal
 * yang memakan tinggi layar. Jika opsi tidak muat, baris bisa digeser
 * horizontal.
 */
export function StatusFilterChips({ value, onChange }: StatusFilterChipsProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.track}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
    >
      {INVOICE_STATUS_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexGrow: 0,
    flexShrink: 0,
  },
  track: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    gap: 2,
    padding: 3,
  },
  segment: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  labelActive: {
    color: colors.white,
  },
});
