import { router, type Href } from 'expo-router';

import type { UserRole } from '@/types/user';

/**
 * Path home berdasarkan role (TB-37, TB-69).
 * Route guard mengarahkan user ke area yang sesuai - bukan ke route
 * yang tidak berhak ia akses.
 */
export function homePathForRole(role: UserRole | null): '/admin' | '/sales' | '/login' {
  if (role === 'admin') {
    return '/admin';
  }
  if (role === 'sales') {
    return '/sales';
  }
  return '/login';
}

/**
 * Kembali ke layar sebelumnya; jika tidak ada riwayat navigasi
 * (mis. masuk lewat deep link), arahkan ke fallback agar user
 * tidak berada di layar tanpa jalan keluar (TB-84).
 */
export function goBackOrReplace(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
