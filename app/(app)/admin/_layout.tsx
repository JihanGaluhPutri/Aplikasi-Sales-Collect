import { Stack } from 'expo-router';

import { AuthErrorScreen } from '@/components/AuthErrorScreen';
import { Loading } from '@/components/Loading';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useRouteGuard } from '@/hooks/useRouteGuard';

/**
 * Route guard area admin (TB-37): hanya `role = admin`.
 * Sales yang membuka /admin/* akan diarahkan ke /sales.
 * Ini UX layer - proteksi data tetap di RLS.
 */
export default function AdminLayout() {
  const { profileError } = useAuth();
  const { allowed } = useRouteGuard('admin');

  if (profileError) {
    return <AuthErrorScreen />;
  }

  if (!allowed) {
    return <Loading variant="fullscreen" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard Admin' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="reports" options={{ title: 'Reports' }} />
      <Stack.Screen name="monitoring" options={{ title: 'Monitoring' }} />
      <Stack.Screen name="customers/index" options={{ title: 'Customers' }} />
      <Stack.Screen name="customers/create" options={{ title: 'Tambah Customer' }} />
      <Stack.Screen name="customers/[id]/index" options={{ title: 'Detail Customer' }} />
      <Stack.Screen name="customers/[id]/edit" options={{ title: 'Edit Customer' }} />
      <Stack.Screen name="sales/index" options={{ title: 'Sales' }} />
      <Stack.Screen name="sales/create" options={{ title: 'Tambah Sales' }} />
      <Stack.Screen name="sales/[id]/index" options={{ title: 'Detail Sales' }} />
      <Stack.Screen name="invoices/index" options={{ title: 'Invoices' }} />
      <Stack.Screen name="invoices/create" options={{ title: 'Tambah Invoice' }} />
      <Stack.Screen name="invoices/[id]/index" options={{ title: 'Detail Invoice' }} />
      <Stack.Screen name="invoices/[id]/edit" options={{ title: 'Edit Invoice' }} />
    </Stack>
  );
}
