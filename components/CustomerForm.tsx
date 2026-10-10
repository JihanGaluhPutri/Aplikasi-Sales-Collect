import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, fontSize } from '@/constants/theme';
import type { Customer, CustomerInput } from '@/types/customer';
import { getUserMessage } from '@/utils/error';
import {
  compactErrors,
  FieldErrors,
  hasErrors,
  MAX_ADDRESS_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  validateMaxLength,
  validatePhone,
  validateRequired,
} from '@/utils/validation';

type CustomerFormKey = 'name' | 'owner_name' | 'phone' | 'address';

export interface CustomerFormProps {
  /** Data awal untuk edit; null/undefined untuk tambah baru. */
  initialValue?: Customer | null;
  submitLabel: string;
  /** Dipanggil setelah validasi lolos; throw menampilkan error form. */
  onSubmit: (input: CustomerInput) => Promise<void>;
}

/**
 * Form customer (TB-40 tambah, TB-42 edit).
 * State & validasi form ada di sini; navigasi/toast ada di screen.
 */
export function CustomerForm({ initialValue, submitLabel, onSubmit }: CustomerFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [ownerName, setOwnerName] = useState(initialValue?.owner_name ?? '');
  const [phone, setPhone] = useState(initialValue?.phone ?? '');
  const [address, setAddress] = useState(initialValue?.address ?? '');
  const [errors, setErrors] = useState<FieldErrors<CustomerFormKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const nextErrors = compactErrors<CustomerFormKey>({
      name: validateRequired(name, 'Nama customer') ?? validateMaxLength(name, MAX_NAME_LENGTH, 'Nama customer'),
      owner_name: validateMaxLength(ownerName, MAX_NAME_LENGTH, 'Nama pemilik'),
      phone: validatePhone(phone) ?? validateMaxLength(phone, MAX_PHONE_LENGTH, 'Nomor telepon'),
      address: validateMaxLength(address, MAX_ADDRESS_LENGTH, 'Alamat'),
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    void onSubmit({
      name: name.trim(),
      owner_name: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Input
        error={errors.name}
        label="Nama Customer*"
        maxLength={MAX_NAME_LENGTH}
        onChangeText={setName}
        placeholder="Contoh: Toko Maju Jaya"
        value={name}
      />
      <Input
        autoCapitalize="words"
        error={errors.owner_name}
        label="Nama Pemilik"
        maxLength={MAX_NAME_LENGTH}
        onChangeText={setOwnerName}
        placeholder="Contoh: Budi Santoso"
        value={ownerName}
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
      <Input
        error={errors.address}
        label="Alamat"
        maxLength={MAX_ADDRESS_LENGTH}
        multiline
        onChangeText={setAddress}
        placeholder="Alamat customer (opsional)"
        value={address}
      />
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Button loading={submitting} onPress={handleSubmit} title={submitLabel} />
    </>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
