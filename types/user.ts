/** Role pengguna aplikasi. Nilai harus sama dengan enum PostgreSQL `user_role`. */
export type UserRole = 'admin' | 'sales';

/**
 * Baris tabel `public.profiles`.
 * Didefinisikan sebagai `type` (bukan `interface`) supaya memenuhi
 * constraint `Record<string, unknown>` dari tipe Supabase/PostgREST.
 */
export type Profile = {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  id: string;
  name: string;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Profile>;
