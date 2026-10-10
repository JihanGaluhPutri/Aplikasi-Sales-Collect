import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { OptionPicker } from '@/components/OptionPicker';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { createSales, getAvailableSalesAccounts } from '@/services/salesService';
import type { Profile } from '@/types/user';
import { getUserMessage } from '@/utils/error';
import {
  compactErrors,
  FieldErrors,
  hasErrors,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  validateMaxLength,
  validatePhone,
  validateRequired,
} from '@/utils/validation';

type SalesFormKey = 'name' | 'phone';

/**
 * Tambah sales (TB-46).
 *
 * ATURAN:
 * - Tidak ada field password - credential tetap milik Supabase Auth.
 * - Pilihan "akun login" hanya MENAUTKAN record sales dengan profile yang
 *   sudah ada (opsional); tidak pernah membuat/menyimpan password.
 */
export default function CreateSalesScreen() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FieldErrors<SalesFormKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [account, setAccount] = useState<Profile | null>(null);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);

  const { data: accounts, loading: accountsLoading, error: accountsError, reload: reloadAccounts } =
    useAsync<Profile[]>(() => getAvailableSalesAccounts(), [], { refetchOnFocus: false });

  const handleSubmit = () => {
    const nextErrors = compactErrors<SalesFormKey>({
      name: validateRequired(name, 'Nama sales') ?? validateMaxLength(name, MAX_NAME_LENGTH, 'Nama sales'),
      phone: validatePhone(phone) ?? validateMaxLength(phone, MAX_PHONE_LENGTH, 'Nomor telepon'),
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    createSales({ name: name.trim(), phone: phone.trim(), user_id: account?.id ?? null })
      .then(() => {
        toast.success('Sales berhasil ditambahkan.');
        router.replace('/admin/sales');
      })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Tambah Sales' }} />
      <Screen>
        <Card>
          <Input
            autoCapitalize="words"
            error={errors.name}
            label="Nama Sales*"
            maxLength={MAX_NAME_LENGTH}
            onChangeText={setName}
            placeholder="Contoh: Sales A"
            value={name}
          />
          <Input
            error={errors.phone}
            keyboardType="phone-pad"
            label="Nomor Telepon"
            maxLength={MAX_PHONE_LENGTH}
            onChangeText={setPhone}
            placeholder="Contoh: 081234567890"
            value={phone}
          />

          <View style={styles.accountGroup}>
            <Text style={styles.label}>Akun Login (opsional)</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAccountPickerOpen(true)}
              style={styles.field}
            >
              <Text style={[styles.fieldValue, !account && styles.placeholder]} numberOfLines={1}>
                {account ? account.name : 'Tanpa akun login'}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
            <Text style={styles.hint}>
              Tautkan akun Supabase Auth yang sudah ada. Password tidak pernah disimpan di tabel sales.
            </Text>
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button loading={submitting} onPress={handleSubmit} title="Simpan Sales" />
        </Card>

        <OptionPicker
          emptyText="Semua akun sales sudah terhubung ke record sales."
          error={accountsError}
          loading={accountsLoading}
          onClose={() => setAccountPickerOpen(false)}
          onSelect={(profileId) => {
            const matched = (accounts ?? []).find((profile) => profile.id === profileId);
            if (matched) {
              setAccount(matched);
            }
          }}
          onRetry={accountsError ? () => void reloadAccounts() : undefined}
          options={(accounts ?? []).map((profile) => ({
            label: profile.name,
            value: profile.id,
          }))}
          selectedValue={account?.id ?? null}
          title="Pilih Akun Login"
          visible={accountPickerOpen}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  accountGroup: {
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
  fieldValue: {
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
  hint: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
