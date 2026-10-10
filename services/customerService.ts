import { supabase } from '@/lib/supabase';
import type { Customer, CustomerInput } from '@/types/customer';
import { AppError, toAppError } from '@/utils/error';
import { sanitizeSearchQuery, validatePhone, validateRequired } from '@/utils/validation';

/**
 * Service layer untuk tabel `customers` (TB-38).
 *
 * Create/update/delete hanya akan berhasil untuk admin - policy RLS
 * `customers_*_admin` menolak user lain di database, bukan hanya di UI.
 * Semua query tetap mengikuti Row Level Security.
 */

function toInputPayload(input: CustomerInput) {
  return {
    name: input.name.trim(),
    owner_name: input.owner_name?.trim() || null,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
  };
}

function validateInput(input: CustomerInput): void {
  const nameError = validateRequired(input.name, 'Nama customer');
  if (nameError) {
    throw new AppError('validation', nameError);
  }

  const phoneError = validatePhone(input.phone ?? '');
  if (phoneError) {
    throw new AppError('validation', phoneError);
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw toAppError(error);
    }

    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Pencarian customer berdasarkan nama, nama pemilik, atau telepon. */
export async function searchCustomers(query: string): Promise<Customer[]> {
  const term = sanitizeSearchQuery(query);
  if (!term) {
    return getCustomers();
  }

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${term}%,owner_name.ilike.%${term}%,phone.ilike.%${term}%`)
    .order('name', { ascending: true });

  if (error) {
    throw toAppError(error);
  }

  return data;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw toAppError(error);
    }

    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  validateInput(input);

  const { data, error } = await supabase
    .from('customers')
    .insert(toInputPayload(input))
    .select('*')
    .single();

  if (error) {
    throw toAppError(error);
  }

  return data;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  validateInput(input);

  const { data, error } = await supabase
    .from('customers')
    .update(toInputPayload(input))
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('authorization', 'Customer tidak ditemukan atau Anda tidak berwenang.');
  }

  return data;
}

/**
 * Hapus customer (TB-43).
 *
 * Database memakai `ON DELETE RESTRICT` pada invoices.customer_id, sehingga
 * customer yang masih memiliki invoice ditolak oleh constraint (error 23503)
 * - tidak ada data invoice yang menjadi orphan.
 */
export async function deleteCustomer(id: string): Promise<void> {
  const { data, error } = await supabase.from('customers').delete().eq('id', id).select('id');

  if (error) {
    throw toAppError(error);
  }

  if (!data || data.length === 0) {
    throw new AppError('authorization', 'Customer tidak ditemukan atau Anda tidak berwenang.');
  }
}
