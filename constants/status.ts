/**
 * Status collection invoice (TB-61, TB-62, TB-68).
 *
 * Satu-satunya sumber label/warna/transisi status untuk service, UI, dan
 * validasi client. Nilai enum diambil dari types/invoice.ts sehingga status
 * konsisten antara database, TypeScript, service, dan UI.
 */

import type { BadgeTone } from '@/components/Badge';
import type { InvoiceStatus } from '@/types/invoice';

export interface StatusMeta {
  /** Label untuk user - jangan pernah menampilkan enum snake_case. */
  label: string;
  tone: BadgeTone;
  /** Status berikutnya dalam flow linear, `null` jika status akhir. */
  next: InvoiceStatus | null;
  /** Label tombol aksi perubahan status, `null` jika tidak ada aksi. */
  actionLabel: string | null;
}

/**
 * Flow linear (TB-61): belum_ditagih -> sudah_ditagih -> dibayar.
 * Transisi diluar ini ditolak oleh service DAN database (RPC).
 */
export const INVOICE_STATUS_META: Record<InvoiceStatus, StatusMeta> = {
  belum_ditagih: {
    label: 'Belum Ditagih',
    tone: 'warning',
    next: 'sudah_ditagih',
    actionLabel: 'Tandai Sudah Ditagih',
  },
  sudah_ditagih: {
    label: 'Sudah Ditagih',
    tone: 'primary',
    next: 'dibayar',
    actionLabel: 'Tandai Dibayar',
  },
  dibayar: {
    label: 'Dibayar',
    tone: 'success',
    next: null,
    actionLabel: null,
  },
};

export interface StatusFilterOption {
  label: string;
  value: InvoiceStatus | null;
}

/** Opsi filter status list invoice (TB-52): Semua + tiga status. */
export const INVOICE_STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { label: 'Semua', value: null },
  { label: INVOICE_STATUS_META.belum_ditagih.label, value: 'belum_ditagih' },
  { label: INVOICE_STATUS_META.sudah_ditagih.label, value: 'sudah_ditagih' },
  { label: INVOICE_STATUS_META.dibayar.label, value: 'dibayar' },
];

/** Apakah `newStatus` adalah transisi linear yang sah dari `currentStatus`. */
export function isValidStatusTransition(
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus,
): boolean {
  return INVOICE_STATUS_META[currentStatus].next === newStatus;
}
