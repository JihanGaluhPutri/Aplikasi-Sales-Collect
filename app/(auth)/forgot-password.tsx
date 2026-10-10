import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { sendPasswordReset } from '@/services/authService';
import type { FieldErrors } from '@/utils/validation';
import { getUserMessage } from '@/utils/error';
import { compactErrors, hasErrors, MAX_EMAIL_LENGTH, validateEmail } from '@/utils/validation';

type ForgotKey = 'email';

/**
 * Forgot password (TB-33): kirim link reset melalui Supabase Auth.
 * Pesan sukses dibuat generik agar keberadaan account tidak dibocorkan.
 */
export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors<ForgotKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const nextErrors = compactErrors<ForgotKey>({ email: validateEmail(email) });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    sendPasswordReset(email)
      .then(() => {
        toast.info('Jika email terdaftar, link reset password sudah dikirim.');
        router.replace('/login');
      })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Lupa Password' }} />
      <Screen>
        <View style={styles.hero}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Masukkan email akun Anda. Kami akan mengirimkan link untuk membuat password baru.
          </Text>
        </View>

        <Card>
          <Input
            error={errors.email}
            label="Email"
            keyboardType="email-address"
            maxLength={MAX_EMAIL_LENGTH}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            value={email}
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button
            loading={submitting}
            onPress={handleSubmit}
            title="Kirim Link Reset Password"
          />
          <Button onPress={() => router.replace('/login')} title="Kembali ke Login" variant="secondary" />
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
    lineHeight: 20,
  },
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
