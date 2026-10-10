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
 * Menu utama area admin (TB-69): Customers, Sales, Invoices, Laporan,
 * Profile, Logout.
 *
 * Menyembunyikan menu hanyalah UX - route tetap dilindungi role guard
 * dan data tetap dilindungi Supabase RLS.
 */
export default function AdminMenuScreen() {
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
      <Stack.Screen options={{ title: 'Dashboard Admin' }} />
      <Screen>
        <Card>
          <MenuLink
            description="Ringkasan kondisi collection"
            onPress={() => router.push('/admin/dashboard')}
            title="Dashboard"
          />
          <MenuLink
            description="Kelola data customer"
            onPress={() => router.push('/admin/customers')}
            title="Customers"
          />
          <MenuLink
            description="Kelola data sales"
            onPress={() => router.push('/admin/sales')}
            title="Sales"
          />
          <MenuLink
            description="Seluruh invoice, assignment, dan status collection"
            onPress={() => router.push('/admin/invoices')}
            title="Invoices"
          />
          <MenuLink
            description="Pantau kondisi collection per invoice dan sales"
            onPress={() => router.push('/admin/monitoring')}
            title="Monitoring"
          />
          <MenuLink
            description="Laporan collection per periode dan per sales"
            onPress={() => router.push('/admin/reports')}
            title="Reports"
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
