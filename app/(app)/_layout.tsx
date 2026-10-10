import { Stack } from 'expo-router';

import { AuthErrorScreen } from '@/components/AuthErrorScreen';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useRouteGuard } from '@/hooks/useRouteGuard';

/**
 * Area aplikasi yang membutuhkan session (protected area).
 *
 * - Session check: hooks/useRouteGuard (TB-37).
 * - Profile gagal dimuat: AuthErrorScreen (bukan loop login).
 * - Route guard hanya UX - keamanan data tetap di Supabase RLS.
 */
export default function AppLayout() {
  const { profileError } = useAuth();
  const { allowed } = useRouteGuard();

  if (profileError) {
    return <AuthErrorScreen />;
  }

  if (!allowed) {
    return <Loading variant="fullscreen" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
