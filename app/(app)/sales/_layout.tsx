import { Stack } from 'expo-router';

import { AuthErrorScreen } from '@/components/AuthErrorScreen';
import { Loading } from '@/components/Loading';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useRouteGuard } from '@/hooks/useRouteGuard';

/**
 * Route guard area sales (TB-37): hanya `role = sales`.
 * Admin yang membuka /sales/* akan diarahkan ke /admin.
 * Ini UX layer - proteksi data tetap di RLS.
 */
export default function SalesLayout() {
  const { profileError } = useAuth();
  const { allowed } = useRouteGuard('sales');

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
      <Stack.Screen name="index" options={{ title: 'Dashboard Sales' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="invoices/index" options={{ title: 'My Invoices' }} />
      <Stack.Screen name="invoices/[id]/index" options={{ title: 'Detail Invoice' }} />
    </Stack>
  );
}
