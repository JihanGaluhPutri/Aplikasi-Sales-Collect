/**
 * Baris tabel `public.customers`.
 * Didefinisikan sebagai `type` (bukan `interface`) supaya memenuhi
 * constraint `Record<string, unknown>` dari tipe Supabase/PostgREST.
 */
export type Customer = {
  id: string;
  name: string;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerInsert = {
  id?: string;
  name: string;
  owner_name?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CustomerUpdate = Partial<Customer>;

/** Input form customer. Field kosong dikirim sebagai `null` oleh service. */
export interface CustomerInput {
  name: string;
  owner_name?: string | null;
  phone?: string | null;
  address?: string | null;
}
