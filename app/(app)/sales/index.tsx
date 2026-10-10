import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { MenuLink } from '@/components/MenuLink';
import { Screen } from '@/components/Screen';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/hooks/useAuth';

/**
 * Menu utama area sales (TB-69): My Invoices, Profile, Logout.
 * Sales TIDAK memiliki menu customer/sales/invoice admin.
 */
export default function SalesMenuScreen() {
  const toast = useToast();
  const { profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    void signOut()
      .then(() => toast.info('Anda telah logout.'))
      .finally(() => setLoggingOut(false));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard Sales' }} />
      <Screen>
        <Card>
          <MenuLink
            description="Ringkasan invoice milik Anda"
            onPress={() => router.push('/sales/dashboard')}
            title="Dashboard"
          />
          <MenuLink
            description="Invoice yang ditugaskan kepada Anda"
            onPress={() => router.push('/sales/invoices')}
            title="My Invoices"
          />
          <MenuLink
            description={profile?.name ?? 'Akun Anda'}
            onPress={() => router.push('/profile')}
            title="Profile"
          />
        </Card>

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
      </Screen>
    </>
  );
}
