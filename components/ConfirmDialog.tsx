import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tombol konfirmasi berwarna danger untuk tindakan destructive (TB-87). */
  destructive?: boolean;
  /** True selama aksi berjalan -> semua tombol dinonaktifkan (anti duplicate submit). */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialog konfirmasi reusable (TB-87) untuk tindakan destructive:
 * delete invoice/customer, nonaktifkan sales, logout, ganti status.
 *
 * - Tombol Batal tidak melakukan aksi (dan tombol backdrop = batal).
 * - Selama `loading`, dialog tertutup terhadap input ganda.
 * - Murni React Native (Modal) - tanpa library tambahan.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={loading ? undefined : onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View accessible accessibilityViewIsModal style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              disabled={loading}
              onPress={onCancel}
              style={styles.action}
              title={cancelLabel}
              variant="secondary"
            />
            <Button
              loading={loading}
              onPress={onConfirm}
              style={styles.action}
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    gap: spacing.sm,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  message: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm + 6,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
