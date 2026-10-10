import { router } from 'expo-router';
import { useEffect } from 'react';

import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/user';
import { homePathForRole } from '@/utils/navigation';
import { consumeSessionExpired } from '@/utils/sessionNotice';

export interface RouteGuardResult {
  /** Masih menunggu session/role - layar harus menampilkan Loading. */
  loading: boolean;
  /** Layar boleh dirender (session ada dan role sesuai). */
  allowed: boolean;
}

/**
 * Route guard (TB-37): requireAuth / requireAdmin / requireSales.
 *
 * PERHATIAN: ini hanya lapisan UX. Keamanan sebenarnya tetap Supabase RLS -
 * user yang memaksa akses langsung ke route / API tetap ditolak database.
 *
 * Jika session hilang tanpa logout manual, user diberi tahu
 * "Sesi Anda berakhir" sebelum diarahkan ke Login (TB-85).
 */
export function useRouteGuard(requiredRole?: UserRole): RouteGuardResult {
  const { status, role } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (status !== 'authenticated') {
      // Session tidak ada / logout / expired -> Login.
      if (consumeSessionExpired()) {
        toast.info('Sesi Anda berakhir. Silakan login kembali.');
      }
      router.replace('/login');
      return;
    }
    if (requiredRole && role !== requiredRole) {
      // Role tidak sesuai -> kembalikan ke area miliknya.
      router.replace(homePathForRole(role));
    }
  }, [status, role, requiredRole, toast]);

  const allowed = status === 'authenticated' && (!requiredRole || role === requiredRole);

  return { loading: !allowed, allowed };
}
