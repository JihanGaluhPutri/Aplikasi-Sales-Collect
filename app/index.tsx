import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { Loading } from '@/components/Loading';
import { useAuth } from '@/hooks/useAuth';
import { homePathForRole } from '@/utils/navigation';
import { hasSeenOnboarding } from '@/utils/onboarding';

/**
 * Entry point: arahkan user berdasarkan session + role (TB-29, TB-37).
 *
 * - Loading -> tampilkan loading (tanpa flash ke login/dashboard).
 * - Session ada -> area role masing-masing (/admin atau /sales).
 * - Tanpa session + belum pernah melihat onboarding -> /onboarding
 *   (ditampilkan sekali sebelum Login/Register).
 * - Tanpa session + sudah melihat onboarding -> /login.
 */
export default function IndexScreen() {
  const { status, role } = useAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasSeenOnboarding()
      .then((seen) => {
        if (!cancelled) {
          setOnboardingSeen(seen);
          setOnboardingChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOnboardingSeen(false);
          setOnboardingChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading' || !onboardingChecked) {
    return <Loading variant="fullscreen" />;
  }

  if (status !== 'authenticated' && !onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={homePathForRole(role)} />;
}
