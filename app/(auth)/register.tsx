import { Link, router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { register } from '@/services/authService';
import type { FieldErrors } from '@/utils/validation';
import { getUserMessage } from '@/utils/error';
import {
  compactErrors,
  hasErrors,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  validateEmail,
  validateMaxLength,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
} from '@/utils/validation';

type RegisterKey = 'name' | 'email' | 'password' | 'confirmPassword';

/**
 * Register (TB-30): validasi -> Supabase Auth signUp -> profile dibuat
 * oleh trigger database (TB-36, role selalu `sales` dari server).
 *
 * Jika konfirmasi email aktif, user diarahkan ke login setelah info dikirim.
 * Jika session langsung terbentuk, (auth)/_layout mengarahkan ke area sales.
 */
export default function RegisterScreen() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<RegisterKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const nextErrors = compactErrors<RegisterKey>({
      name: validateRequired(name, 'Nama') ?? validateMaxLength(name, MAX_NAME_LENGTH, 'Nama'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validatePasswordConfirmation(password, confirmPassword),
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    register({ name: name.trim(), email, password, confirmPassword })
      .then((result) => {
        if (result.requiresEmailConfirmation) {
          toast.info('Pendaftaran berhasil. Periksa email untuk konfirmasi, lalu login.');
          router.replace('/login');
        } else {
          toast.success('Akun berhasil dibuat.');
        }
      })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Daftar' }} />
      <Screen>
        <View style={styles.hero}>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>Role awal setiap pendaftaran adalah sales.</Text>
        </View>

        <Card>
          <Input
            autoCapitalize="words"
            error={errors.name}
            label="Nama"
            maxLength={MAX_NAME_LENGTH}
            onChangeText={setName}
            placeholder="Nama lengkap"
            value={name}
          />
          <Input
            error={errors.email}
            label="Email"
            keyboardType="email-address"
            maxLength={MAX_EMAIL_LENGTH}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            value={email}
          />
          <Input
            error={errors.password}
            label="Password"
            onChangeText={setPassword}
            placeholder="Minimal 8 karakter"
            secureTextEntry
            value={password}
          />
          <Input
            error={errors.confirmPassword}
            label="Konfirmasi Password"
            onChangeText={setConfirmPassword}
            placeholder="Ulangi password"
            secureTextEntry
            value={confirmPassword}
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button loading={submitting} onPress={handleSubmit} title="Daftar" />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun?</Text>
          <Link href="/login" style={styles.link}>
            Login
          </Link>
        </View>
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
  link: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  footerText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
});
