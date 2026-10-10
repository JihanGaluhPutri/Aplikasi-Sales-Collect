import { isValidStatusTransition } from '@/constants/status';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types/customer';
import type {
  Invoice,
  InvoiceDetail,
  InvoiceInput,
  InvoiceQueryOptions,
  InvoiceStatus,
  InvoiceSummary,
  StatusHistoryItem,
} from '@/types/invoice';
import type { Sales } from '@/types/sales';
import { AppError, toAppError } from '@/utils/error';
import { sanitizeSearchQuery, validateRequired } from '@/utils/validation';

/**
 * Service layer untuk tabel `invoices` dan `invoice_status_history`
 * (TB-49 s/d TB-65).
 *
 * PENTING:
 * - Service tidak pernah mempercayai `sales_id` dari frontend sebagai bukti
 *   kepemilikan. Proteksi sebenarnya tetap di Supabase RLS: jika sales meminta
 *   invoice sales lain, database mengembalikan baris kosong / error.
 * - Status collection hanya diubah lewat RPC `update_invoice_status` (TB-63)
 *   agar `invoices.status` dan `invoice_status_history` selalu atomic.
 * - Edit invoice tidak menyentuh kolom `status` (TB-55) - status diubah hanya
 *   melalui flow status khusus agar history terkontrol.
 */

/** Select invoice lengkap beserta relasi customer & sales (TB-54, TB-65). */
const INVOICE_DETAIL_SELECT = '*, customers(*), sales(*)';

/** Select invoice untuk list: cukup nama customer & sales (TB-50). */
const INVOICE_SUMMARY_SELECT = '*, customers(name), sales(name)';

type InvoiceDetailRow = Invoice & {
  customers: Customer | null;
  sales: Sales | null;
};

type InvoiceSummaryRow = Invoice & {
  customers: { name: string } | null;
  sales: { name: string } | null;
};

function toDetail(row: InvoiceDetailRow): InvoiceDetail {
  const { customers, sales, ...invoice } = row;
  return { ...invoice, customer: customers, assignedSales: sales };
}

function toSummary(row: InvoiceSummaryRow): InvoiceSummary {
  const { customers, sales, ...invoice } = row;
  return {
    ...invoice,
    customerName: customers?.name ?? null,
    salesName: sales?.name ?? null,
  };
}

/**
 * Validasi assignment: sales harus ada dan masih aktif (TB-57).
 * Dipanggil sebelum create/update/assign invoice.
 */
async function assertSalesAssignable(salesId: string): Promise<void> {
  const { data, error } = await supabase
    .from('sales')
    .select('id, name, is_active')
    .eq('id', salesId)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('validation', 'Sales tidak ditemukan.');
  }

  if (!data.is_active) {
    throw new AppError(
      'validation',
      `${data.name} sudah tidak aktif dan tidak dapat menerima invoice baru.`,
    );
  }
}

/** Id record sales milik user yang sedang login (untuk My Invoice). */
async function getMySalesId(): Promise<string | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw toAppError(authError);
  }

  const userId = authData.user?.id;
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('sales')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  return data?.id ?? null;
}

/**
 * List invoice dengan search + filter status (TB-50, TB-51, TB-52).
 *
 * Search dinormalisasi dulu lalu dicocokkan ke nomor invoice ATAU nama
 * customer (query terpisah untuk customer - tidak mengunduh seluruh tabel).
 * Filter tetap mengikuti RLS: sales hanya mendapatkan invoice miliknya.
 */
export async function getInvoices(options: InvoiceQueryOptions = {}): Promise<InvoiceSummary[]> {
  let query = supabase
    .from('invoices')
    .select(INVOICE_SUMMARY_SELECT)
    .order('invoice_date', { ascending: false })
    .order('invoice_number', { ascending: false });

  if (options.customerId) {
    query = query.eq('customer_id', options.customerId);
  }

  if (options.salesId) {
    query = query.eq('sales_id', options.salesId);
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.startDate) {
    query = query.gte('invoice_date', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('invoice_date', options.endDate);
  }

  const term = sanitizeSearchQuery(options.search ?? '');
  if (term) {
    const { data: matchedCustomers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .ilike('name', `%${term}%`)
      .limit(200);

    if (customerError) {
      throw toAppError(customerError);
    }

    const customerIds = (matchedCustomers ?? []).map((customer) => customer.id);

    query =
      customerIds.length > 0
        ? query.or(`invoice_number.ilike.%${term}%,customer_id.in.(${customerIds.join(',')})`)
        : query.ilike('invoice_number', `%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw toAppError(error);
  }

  return (data ?? []).map(toSummary);
}

/**
 * TB-59: invoice milik sales yang sedang login.
 *
 * Filter ownership dilakukan di query DAN di RLS - bukan hanya di frontend.
 * Sales tanpa record sales tidak memiliki invoice sama sekali.
 */
export async function getMyInvoices(options: InvoiceQueryOptions = {}): Promise<InvoiceSummary[]> {
  const salesId = await getMySalesId();
  if (!salesId) {
    return [];
  }
  return getInvoices({ ...options, salesId });
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select(INVOICE_DETAIL_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    return null;
  }

  return toDetail(data);
}

/** TB-53: buat invoice baru. Status selalu `belum_ditagih` (default DB). */
export async function createInvoice(input: InvoiceInput): Promise<InvoiceDetail> {
  const numberError = validateRequired(input.invoice_number, 'Nomor invoice');
  if (numberError) {
    throw new AppError('validation', numberError);
  }

  if (!input.customer_id) {
    throw new AppError('validation', 'Customer wajib dipilih.');
  }

  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new AppError('validation', 'Nominal tidak valid.');
  }

  if (input.sales_id) {
    await assertSalesAssignable(input.sales_id);
  }

  const notes = input.notes?.trim();

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number: input.invoice_number.trim(),
      customer_id: input.customer_id,
      sales_id: input.sales_id,
      amount: input.amount,
      invoice_date: input.invoice_date,
      due_date: input.due_date,
      notes: notes ? notes : null,
      status: 'belum_ditagih',
    })
    .select(INVOICE_DETAIL_SELECT)
    .single();

  if (error) {
    throw toAppError(error);
  }

  return toDetail(data);
}

/**
 * TB-55: edit invoice. Tidak pernah menyentuh kolom `status` sehingga
 * perubahan edit tidak merusak/mengulang status history.
 */
export async function updateInvoice(id: string, patch: Partial<InvoiceInput>): Promise<InvoiceDetail> {
  const payload: Partial<Invoice> = {};

  if (patch.invoice_number !== undefined) {
    const numberError = validateRequired(patch.invoice_number, 'Nomor invoice');
    if (numberError) {
      throw new AppError('validation', numberError);
    }
    payload.invoice_number = patch.invoice_number.trim();
  }

  if (patch.customer_id !== undefined) {
    if (!patch.customer_id) {
      throw new AppError('validation', 'Customer wajib dipilih.');
    }
    payload.customer_id = patch.customer_id;
  }

  if (patch.amount !== undefined) {
    if (!Number.isFinite(patch.amount) || patch.amount < 0) {
      throw new AppError('validation', 'Nominal tidak valid.');
    }
    payload.amount = patch.amount;
  }

  if (patch.invoice_date !== undefined) {
    payload.invoice_date = patch.invoice_date;
  }

  if (patch.due_date !== undefined) {
    payload.due_date = patch.due_date;
  }

  if (patch.sales_id !== undefined && patch.sales_id) {
    await assertSalesAssignable(patch.sales_id);
  }

  if (patch.sales_id !== undefined) {
    payload.sales_id = patch.sales_id;
  }

  if (patch.notes !== undefined) {
    const notes = patch.notes?.trim();
    payload.notes = notes ? notes : null;
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError('validation', 'Tidak ada perubahan untuk disimpan.');
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select(INVOICE_DETAIL_SELECT)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('authorization', 'Invoice tidak ditemukan atau Anda tidak berwenang.');
  }

  return toDetail(data);
}

/** TB-56: hapus invoice (admin only - RLS menolak sales). */
export async function deleteInvoice(id: string): Promise<void> {
  const { data, error } = await supabase.from('invoices').delete().eq('id', id).select('id');

  if (error) {
    throw toAppError(error);
  }

  if (!data || data.length === 0) {
    throw new AppError('authorization', 'Invoice tidak ditemukan atau Anda tidak berwenang.');
  }
  // History ikut terhapus oleh ON DELETE CASCADE - tidak ada record orphan.
}

/**
 * TB-57: assign / reassign invoice ke sales.
 * `salesId = null` berarti melepas penugasan.
 */
export async function assignInvoice(invoiceId: string, salesId: string | null): Promise<InvoiceDetail> {
  if (salesId) {
    await assertSalesAssignable(salesId);
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({ sales_id: salesId })
    .eq('id', invoiceId)
    .select(INVOICE_DETAIL_SELECT)
    .maybeSingle();

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('authorization', 'Invoice tidak ditemukan atau Anda tidak berwenang.');
  }

  return toDetail(data);
}

/**
 * TB-63: update status collection via RPC database (atomic + history).
 *
 * Proses: ambil invoice saat ini -> cek kewenangan -> validasi transisi
 * linear -> upload bukti pembayaran (jika transisi ke `dibayar`) ->
 * update + history + payment_proof_path dalam satu transaksi database.
 *
 * Enhancement bukti pembayaran:
 * - Transisi ke `dibayar` WAJIB menyertakan `proofPath` hasil upload yang
 *   sudah berhasil - jika upload gagal, status TIDAK berubah sama sekali.
 * - `proofPath` tidak diterima untuk transisi lain.
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: InvoiceStatus,
  options?: { proofPath?: string | null },
): Promise<Invoice> {
  const current = await getInvoiceById(invoiceId);

  if (!current) {
    throw new AppError('authorization', 'Invoice tidak ditemukan atau Anda tidak berwenang.');
  }

  if (!isValidStatusTransition(current.status, newStatus)) {
    throw new AppError(
      'validation',
      current.status === newStatus
        ? 'Status invoice sudah sama.'
        : 'Transisi status harus linear: Belum Ditagih -> Sudah Ditagih -> Dibayar.',
    );
  }

  const proofPath = options?.proofPath ?? null;

  if (newStatus === 'dibayar' && !proofPath) {
    throw new AppError(
      'validation',
      'Bukti pembayaran wajib diunggah sebelum menandai invoice sebagai Dibayar.',
    );
  }

  if (newStatus !== 'dibayar' && proofPath) {
    throw new AppError('validation', 'Bukti pembayaran hanya berlaku untuk status Dibayar.');
  }

  const { data, error } = await supabase.rpc('update_invoice_status', {
    p_invoice_id: invoiceId,
    p_new_status: newStatus,
    p_payment_proof_path: proofPath,
  });

  if (error) {
    throw toAppError(error);
  }

  if (!data) {
    throw new AppError('database', 'Status gagal diperbarui. Silakan coba lagi.');
  }

  return data;
}

/** TB-64: riwayat perubahan status satu invoice, beserta nama pelaku. */
export async function getInvoiceHistory(invoiceId: string): Promise<StatusHistoryItem[]> {
  const { data, error } = await supabase
    .from('invoice_status_history')
    .select('*, profiles(name)')
    .eq('invoice_id', invoiceId)
    .order('changed_at', { ascending: true });

  if (error) {
    throw toAppError(error);
  }

  return (data ?? []).map(({ profiles, ...entry }) => ({
    ...entry,
    changedByName: profiles?.name ?? null,
  }));
}

/** Jumlah invoice milik sebuah customer (untuk pemeriksaan sebelum delete). */
export async function countInvoicesByCustomerId(customerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId);

  if (error) {
    throw toAppError(error);
  }

  return count ?? 0;
}
