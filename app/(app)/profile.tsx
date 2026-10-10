import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/services/profileService';
import { getUserMessage } from '@/utils/error';
import { MAX_NAME_LENGTH, validateMaxLength, validateRequired } from '@/utils/validation';

/**
 * Profile (TB-69): tersedia untuk admin & sales.
 * Nama bisa diubah untuk profile sendiri; email/role hanya baca
 * (role ditentukan database - bukan input user).
 */
export default function ProfileScreen() {
  const toast = useToast();
  const { profile, user, role, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [syncedProfileName, setSyncedProfileName] = useState(profile?.name ?? '');

  // Sinkronkan field nama dengan profile terbaru (mis. setelah save/refresh)
  // supaya tidak menampilkan data lama (TB-84). Dilakukan saat render
  // (pola "adjust state when props change") - bukan di dalam effect.
  if ((profile?.name ?? '') !== syncedProfileName) {
    const nextName = profile?.name ?? '';
    setSyncedProfileName(nextName);
    setName(nextName);
  }

  const roleLabel = role === 'admin' ? 'Admin' : 'Sales';

  const handleSave = () => {
    const error = validateRequired(name, 'Nama') ?? validateMaxLength(name, MAX_NAME_LENGTH, 'Nama');
    setNameError(error);
    setFormError(null);

    if (error) {
      return;
    }

    setSaving(true);
    updateProfile({ name: name.trim() })
      .then(() => refreshProfile())
      .then(() => toast.success('Profile berhasil diperbarui.'))
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSaving(false));
  };

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    void signOut().finally(() => setLoggingOut(false));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Profile' }} />
      <Screen>
        <Card>
          <Input
            error={nameError}
            label="Nama"
            maxLength={MAX_NAME_LENGTH}
            onChangeText={setName}
            placeholder="Nama lengkap"
            value={name}
          />
          <DetailRow label="Email" value={user?.email ?? '-'} />
          <DetailRow label="Role" value={roleLabel} />
          <DetailRow label="ID Akun" value={profile?.id ?? '-'} />
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}
          <Button loading={saving} onPress={handleSave} title="Simpan" />
        </Card>

        <View style={styles.logoutWrap}>
          <Button
            disabled={loggingOut}
            onPress={() => setLogoutConfirmVisible(true)}
            title="Logout"
            variant="danger"
          />
          <ConfirmDialog
            confirmLabel="Keluar"
            destructive
            loading={loggingOut}
            message="Anda harus login kembali untuk menggunakan aplikasi."
            onCancel={() => {
              if (!loggingOut) {
                setLogoutConfirmVisible(false);
              }
            }}
            onConfirm={handleLogout}
            title="Keluar dari akun?"
            visible={logoutConfirmVisible}
          />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  logoutWrap: {
    marginTop: spacing.sm,
  },
});
