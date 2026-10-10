import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

import { Loading } from '@/components/Loading';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { homePathForRole } from '@/utils/navigation';

/**
 * Area public (login, register, forgot/reset password).
 * Jika sudah ada session, user diarahkan ke area role masing-masing
 * sehingga tidak melihat layar login lagi (TB-31).
 */
export default function AuthLayout() {
  const { status, role, passwordRecovery } = useAuth();

  useEffect(() => {
    // Selama mode reset password, user tetap di area auth
    // (link recovery tidak boleh dilempar ke dashboard).
    if (status === 'authenticated' && !passwordRecovery) {
      router.replace(homePathForRole(role));
    }
  }, [status, role, passwordRecovery]);

  if (status === 'authenticated' && !passwordRecovery) {
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
    />
  );
}
