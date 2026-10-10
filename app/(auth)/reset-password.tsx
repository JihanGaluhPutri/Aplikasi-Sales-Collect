import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { updatePassword } from '@/services/authService';
import type { FieldErrors } from '@/utils/validation';
import { getUserMessage } from '@/utils/error';
import {
  compactErrors,
  hasErrors,
  validatePassword,
  validatePasswordConfirmation,
} from '@/utils/validation';

type ResetKey = 'password' | 'confirmPassword';

/**
 * Reset password (TB-34): password baru disimpan oleh Supabase Auth
 * (`auth.updateUser`) - tidak pernah ke tabel aplikasi.
 *
 * Screen ini dibuka dari link reset (PASSWORD_RECOVERY). Setelah berhasil,
 * mode recovery diakhiri dan (auth)/_layout mengarahkan user ke area role.
 */
export default function ResetPasswordScreen() {
  const toast = useToast();
  const { clearPasswordRecovery, status } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<ResetKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const nextErrors = compactErrors<ResetKey>({
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    // Session recovery tidak ada -> link basi / halaman dibuka manual.
    if (status === 'unauthenticated') {
      setFormError(
        'Link reset tidak valid atau sudah kedaluwarsa. Minta link baru melalui Lupa Password.',
      );
      return;
    }

    setSubmitting(true);
    updatePassword(password, confirmPassword)
      .then(() => {
        toast.success('Password berhasil diperbarui. Gunakan password baru untuk login.');
        clearPasswordRecovery();
      })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Password Baru' }} />
      <Screen>
        <View style={styles.hero}>
          <Text style={styles.title}>Buat Password Baru</Text>
          <Text style={styles.subtitle}>Password baru akan disimpan oleh Supabase Auth.</Text>
        </View>

        <Card>
          <Input
            error={errors.password}
            label="Password Baru"
            onChangeText={setPassword}
            placeholder="Minimal 8 karakter"
            secureTextEntry
            value={password}
          />
          <Input
            error={errors.confirmPassword}
            label="Konfirmasi Password"
            onChangeText={setConfirmPassword}
            placeholder="Ulangi password baru"
            secureTextEntry
            value={confirmPassword}
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button loading={submitting} onPress={handleSubmit} title="Simpan Password" />
        </Card>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
