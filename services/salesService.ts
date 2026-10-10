import { getInvoices } from '@/services/invoiceService';
import { getProfilesByRole } from '@/services/profileService';
import { supabase } from '@/lib/supabase';
import type { InvoiceSummary } from '@/types/invoice';
import type { Profile } from '@/types/user';
import type { Sales, SalesInput } from '@/types/sales';
import { AppError, toAppError } from '@/utils/error';
import { validatePhone, validateRequired } from '@/utils/validation';

/**
 * Service layer untuk tabel `sales` (TB-44 s/d TB-48).
 *
 * ATURAN:
 * - Tidak pernah menyimpan password. Credential login hanya milik Supabase
 *   Auth; `user_id` hanya menautkan record sales ke profile yang sudah ada.
 * - Sales nonaktif TIDAK dihapus - hanya flag `is_active` diubah, sehingga
 *   invoice historical tetap utuh (ON DELETE RESTRICT pada invoices.sales_id).
 * - Assignment invoice baru hanya boleh ke sales aktif (divalidasi service
 *   invoiceService + aturan bisnis di UI).
 */

function validateName(name: string): void {
  const nameError = validateRequired(name, 'Nama sales');
  if (nameError) {
    throw new AppError('validation', nameError);
  }
}

async function updateSalesRow(id: string, patch: Partial<Sales>): Promise<Sales> {
  const { data, error } = await supabase
    .from('sales')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('authorization', 'Sales tidak ditemukan atau Anda tidak berwenang.');
  }

  return data;
}

export async function getSales(): Promise<Sales[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
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

export async function getSalesById(id: string): Promise<Sales | null> {
  try {
    const { data, error } = await supabase.from('sales').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw toAppError(error);
    }

    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getActiveSales(): Promise<Sales[]> {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw toAppError(error);
    }

    return data;
  } catch (error) {
    throw toAppError(error);
  }
}

/** TB-46: tambah record sales (tanpa password). */
export async function createSales(input: SalesInput): Promise<Sales> {
  validateName(input.name);

  const phoneError = validatePhone(input.phone ?? '');
  if (phoneError) {
    throw new AppError('validation', phoneError);
  }

  if (input.user_id) {
    await assertLinkableAccount(input.user_id);
  }

  const { data, error } = await supabase
    .from('sales')
    .insert({
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      user_id: input.user_id ?? null,
      is_active: true,
    })
    .select('*')
    .single();

  if (error) {
    throw toAppError(error);
  }

  return data;
}

export async function updateSales(id: string, input: Partial<SalesInput>): Promise<Sales> {
  const patch: Partial<Sales> = {};

  if (input.name !== undefined) {
    validateName(input.name);
    patch.name = input.name.trim();
  }

  if (input.phone !== undefined) {
    const phoneError = validatePhone(input.phone ?? '');
    if (phoneError) {
      throw new AppError('validation', phoneError);
    }
    patch.phone = input.phone?.trim() || null;
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError('validation', 'Tidak ada perubahan untuk disimpan.');
  }

  return updateSalesRow(id, patch);
}

/** TB-48: aktif/nonaktif sales tanpa menghapus data historical. */
export async function setSalesActive(id: string, isActive: boolean): Promise<Sales> {
  return updateSalesRow(id, { is_active: isActive });
}

/** Menautkan record sales dengan profile akun login (tanpa credential). */
export async function setSalesAccount(salesId: string, userId: string | null): Promise<Sales> {
  if (userId) {
    await assertLinkableAccount(userId);
  }
  return updateSalesRow(salesId, { user_id: userId });
}

/** TB-47: daftar invoice yang ditugaskan ke sales tertentu. */
export async function getSalesInvoices(salesId: string): Promise<InvoiceSummary[]> {
  return getInvoices({ salesId });
}

/**
 * Akun login ber- role sales yang BELUM terhubung ke record sales mana pun -
 * dipakai form tambah sales / tautan akun (TB-46).
 */
export async function getAvailableSalesAccounts(): Promise<Profile[]> {
  const [accounts, salesRows] = await Promise.all([getProfilesByRole('sales'), getSales()]);

  const linkedUserIds = new Set(
    salesRows.map((row) => row.user_id).filter((value): value is string => Boolean(value)),
  );

  return accounts.filter((account) => !linkedUserIds.has(account.id));
}

async function assertLinkableAccount(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('validation', 'Akun login tidak ditemukan.');
  }

  if (data.role !== 'sales') {
    throw new AppError('validation', 'Hanya akun dengan role sales yang dapat ditautkan.');
  }
}
