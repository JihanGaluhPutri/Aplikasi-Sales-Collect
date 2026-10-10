import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/user';
import { AppError, toAppError } from '@/utils/error';
import { validateRequired } from '@/utils/validation';

/**
 * Service layer untuk tabel `profiles` (TB-35, TB-36).
 *
 * Profile SELALU diambil dari authenticated user pada session saat ini.
 * ID user tidak pernah diterima dari UI untuk menentukan profile aktif.
 *
 * Role berasal dari database (profiles.role), bukan dari input frontend.
 * Self-register selalu mendapatkan role 'sales' (ditegakkan oleh trigger TB-36
 * dan policy RLS `profiles_insert_self_or_admin`).
 */

async function getAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw toAppError(error);
  }
  if (!data.user) {
    throw new AppError('authentication', 'Sesi Anda berakhir. Silakan login kembali.');
  }
  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw toAppError(authError);
    }

    const user = authData.user;
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw toAppError(error);
    }

    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}

/** Mengambil profile berdasarkan id. RLS tetap menentukan boleh/tidak. */
export async function getProfileById(id: string): Promise<Profile | null> {
  if (!id) {
    return null;
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  return data;
}

/**
 * Membuat profile untuk user yang sedang login.
 * Role selalu 'sales' - RLS menolak selain itu untuk user non-admin.
 */
export async function createProfile(input: { name: string }): Promise<Profile> {
  const nameError = validateRequired(input.name, 'Nama');
  if (nameError) {
    throw new AppError('validation', nameError);
  }

  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: user.id, name: input.name.trim(), role: 'sales' })
    .select('*')
    .single();

  if (error) {
    throw toAppError(error);
  }

  return data;
}

/**
 * TB-36: memastikan user yang sedang login selalu punya profile.
 *
 * Jalur utama: trigger database `handle_new_user` (migration 010).
 * Fungsi ini adalah fallback aplikasi bila profile belum ada (misalnya database
 * lama), sehingga tidak pernah ada auth user tanpa profile.
 */
export async function ensureCurrentProfile(): Promise<Profile> {
  const user = await getAuthenticatedUser();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw toAppError(profileError);
  }

  if (profile) {
    return profile;
  }

  const metadata = user.user_metadata as { name?: unknown } | null | undefined;
  const nameFromMetadata = typeof metadata?.name === 'string' ? metadata.name.trim() : '';
  const nameFromEmail = user.email ? user.email.split('@')[0] : '';
  const fallbackName = nameFromMetadata || nameFromEmail || 'Pengguna';

  return createProfile({ name: fallbackName });
}

/**
 * Update profile milik user yang sedang login.
 * Role tidak bisa diubah dari sini: RLS `profiles_update_self_or_admin`
 * menolak perubahan role oleh user non-admin.
 */
export async function updateProfile(input: { name: string }): Promise<Profile> {
  const nameError = validateRequired(input.name, 'Nama');
  if (nameError) {
    throw new AppError('validation', nameError);
  }

  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('profiles')
    .update({ name: input.name.trim() })
    .eq('id', user.id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('authorization', 'Anda tidak memiliki akses untuk mengubah profile ini.');
  }

  return data;
}

/** Mengambil profile berdasarkan role (dipakai admin, mis. untuk tautan akun sales). */
export async function getProfilesByRole(role: UserRole): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('name', { ascending: true });

  if (error) {
    throw toAppError(error);
  }

  return data;
}
