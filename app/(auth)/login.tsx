import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { login } from '@/services/authService';
import type { FieldErrors } from '@/utils/validation';
import { getUserMessage } from '@/utils/error';
import { compactErrors, hasErrors, MAX_EMAIL_LENGTH, validateEmail } from '@/utils/validation';

type LoginKey = 'email' | 'password';

/**
 * Login (TB-31): email + password -> Supabase Auth -> session -> profile -> role.
 * Redirect ke area role dilakukan otomatis oleh (auth)/_layout
 * begitu status berubah menjadi `authenticated`.
 */
export default function LoginScreen() {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<LoginKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const nextErrors = compactErrors<LoginKey>({
      email: validateEmail(email),
      password: password ? null : 'Password wajib diisi.',
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    login({ email: email.trim(), password })
      .then(() => toast.success('Login berhasil.'))
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header disembunyikan -> safe area atas ditangani di sini (TB-84). */}
      <Screen contentStyle={{ paddingTop: insets.top + spacing.md }}>
        <View style={styles.hero}>
          <Text style={styles.appName}>SalesCollect</Text>
          <Text style={styles.tagline}>Login untuk melanjutkan</Text>
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
          <Input
            error={errors.password}
            label="Password"
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            value={password}
          />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button loading={submitting} onPress={handleSubmit} title="Login" />
          <Link href="/forgot-password" style={styles.link}>
            Lupa password?
          </Link>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun?</Text>
          <Link href="/register" style={styles.link}>
            Daftar
          </Link>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  appName: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  tagline: {
    color: colors.secondary,
    fontSize: fontSize.md,
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
    textAlign: 'center',
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
