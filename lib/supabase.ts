import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from '@supabase/supabase-js';

import type { Database } from '@/types/database';

/**
 * Konfigurasi Supabase untuk aplikasi mobile.
 * Hanya membaca environment variable publik (EXPO_PUBLIC_*).
 *
 * ATURAN:
 * - Jangan pernah menaruh service-role key di aplikasi ini.
 * - Jangan hardcode URL/key di source code.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Konfigurasi Supabase belum lengkap. Salin .env.example menjadi .env lalu isi ' +
      'EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

type AuthStorage = NonNullable<
  NonNullable<SupabaseClientOptions<Database>['auth']>['storage']
>;

/**
 * Batas waktu satu request (TB-86): internet lambat / koneksi terputus
 * tidak boleh menggantung selamanya - setelah timeout request dibatalkan
 * dan dipetakan ke pesan "Koneksi bermasalah" oleh utils/error.
 *
 * MVP tidak memiliki offline database; cukup loading + error + retry.
 */
const REQUEST_TIMEOUT_MS = 15_000;

/** fetch dengan timeout - dipakai Supabase client untuk semua request. */
const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Network request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Storage session aman untuk semua environment:
 * - React Native / browser: AsyncStorage (persist session di perangkat).
 * - Static rendering web (SSR Node): `window` tidak ada, maka akses storage
 *   dilewati agar proses export tidak crash; session restore tetap jalan
 *   di browser setelah halaman dimuat.
 */
const storage: AuthStorage = {
  getItem: (key) => (typeof window === 'undefined' ? null : AsyncStorage.getItem(key)),
  setItem: (key, value) =>
    typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.setItem(key, value),
  removeItem: (key) =>
    typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.removeItem(key),
};

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  },
);
