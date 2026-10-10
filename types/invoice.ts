import type { Customer } from '@/types/customer';
import type { Sales } from '@/types/sales';

/** Status collection invoice. Nilai harus sama dengan enum PostgreSQL `invoice_status`. */
export type InvoiceStatus = 'belum_ditagih' | 'sudah_ditagih' | 'dibayar';

/**
 * Baris tabel `public.invoices`.
 * Didefinisikan sebagai `type` (bukan `interface`) supaya memenuhi
 * constraint `Record<string, unknown>` dari tipe Supabase/PostgREST.
 */
export type Invoice = {
  id: string;
  invoice_number: string;
  customer_id: string;
  sales_id: string | null;
  amount: number;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  /** Path bukti pembayaran di bucket private `payment-proofs` (null = belum ada). */
  payment_proof_path: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceInsert = {
  id?: string;
  invoice_number: string;
  customer_id: string;
  sales_id?: string | null;
  amount: number;
  invoice_date: string;
  due_date: string;
  status?: InvoiceStatus;
  notes?: string | null;
  payment_proof_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InvoiceUpdate = Partial<Invoice>;

/**
 * Baris tabel `public.invoice_status_history`.
 * Didefinisikan sebagai `type` (bukan `interface`) supaya memenuhi
 * constraint `Record<string, unknown>` dari tipe Supabase/PostgREST.
 */
export type InvoiceStatusHistory = {
  id: string;
  invoice_id: string;
  old_status: InvoiceStatus | null;
  new_status: InvoiceStatus;
  changed_by: string | null;
  changed_at: string;
};

export type InvoiceStatusHistoryInsert = {
  id?: string;
  invoice_id: string;
  old_status?: InvoiceStatus | null;
  new_status: InvoiceStatus;
  changed_by?: string | null;
  changed_at?: string;
};

export type InvoiceStatusHistoryUpdate = Partial<InvoiceStatusHistory>;

// ---------------------------------------------------------------------------
// Bentuk data untuk service layer (PART 2 - TB-49 s/d TB-64)
// ---------------------------------------------------------------------------

/** Input form invoice. `status` tidak pernah dikirim dari UI (default DB). */
export interface InvoiceInput {
  invoice_number: string;
  customer_id: string;
  sales_id: string | null;
  amount: number;
  invoice_date: string;
  due_date: string;
  notes: string | null;
}

/** Opsi query list invoice. Filter tetap mengikuti RLS di database. */
export interface InvoiceQueryOptions {
  search?: string;
  status?: InvoiceStatus | null;
  customerId?: string;
  salesId?: string;
  /** Rentang `invoice_date` (inclusive, format YYYY-MM-DD) - dipakai export detail laporan. */
  startDate?: string;
  endDate?: string;
}

/** Invoice untuk list/card: sudah menyertakan nama customer dan sales. */
export interface InvoiceSummary extends Invoice {
  customerName: string | null;
  salesName: string | null;
}

/** Invoice lengkap untuk halaman detail: menyertakan relasi customer & sales. */
export interface InvoiceDetail extends Invoice {
  customer: Customer | null;
  assignedSales: Sales | null;
}

/** Baris history status yang sudah menyertakan nama pelaku perubahan. */
export interface StatusHistoryItem extends InvoiceStatusHistory {
  changedByName: string | null;
}
