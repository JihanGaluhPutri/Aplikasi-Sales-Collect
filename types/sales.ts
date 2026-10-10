/**
 * Baris tabel `public.sales`.
 * Didefinisikan sebagai `type` (bukan `interface`) supaya memenuhi
 * constraint `Record<string, unknown>` dari tipe Supabase/PostgREST.
 */
export type Sales = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SalesInsert = {
  id?: string;
  user_id?: string | null;
  name: string;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SalesUpdate = Partial<Sales>;

/**
 * Input form sales.
 *
 * ATURAN (TB-46): tidak ada field password. Credential login selalu milik
 * Supabase Auth; `user_id` hanya menautkan record sales ke profile yang sudah
 * terdaftar, bukan tempat menyimpan credential.
 */
export interface SalesInput {
  name: string;
  phone?: string | null;
  user_id?: string | null;
}
