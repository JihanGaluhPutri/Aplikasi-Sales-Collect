import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

/**
 * Ditampilkan ketika session ada tetapi profile gagal dimuat (TB-36/29).
 * Mencegah loop login -> dashboard -> login; user bisa coba lagi atau keluar.
 */
export function AuthErrorScreen() {
  const { profileError, refreshProfile, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>
      <Text style={styles.title}>Gagal memuat profil</Text>
      <Text style={styles.message}>
        {profileError ??
          'Terjadi kesalahan saat membaca data profil Anda. Coba lagi, atau keluar lalu masuk kembali.'}
      </Text>
      <Button onPress={() => void refreshProfile()} style={styles.action} title="Coba Lagi" />
      <Button onPress={() => void signOut()} style={styles.action} title="Keluar" variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderColor: colors.warning,
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  iconText: {
    color: colors.warning,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  message: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  action: {
    minWidth: 240,
  },
});
