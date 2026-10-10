/**
 * Validasi form (TB-30, TB-40, TB-53, dst).
 *
 * Setiap fungsi mengembalikan pesan error untuk user, atau `null` jika valid.
 * Validasi frontend hanya untuk UX - keamanan/konsistensi data tetap ditangani
 * database (constraint + RLS).
 */

/** Map error per field. Kunci diisi sendiri oleh tiap screen. */
export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Batas panjang input (TB-88). Database tidak membatasi panjang teks,
 * jadi batas ini mencegah input tidak masuk akal + memberi pesan jelas
 * ke user sebelum sampai ke server.
 */
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_PHONE_LENGTH = 20;
export const MAX_ADDRESS_LENGTH = 250;
export const MAX_INVOICE_NUMBER_LENGTH = 50;
export const MAX_NOTES_LENGTH = 500;

export function validateRequired(value: string, label: string): string | null {
  return value.trim().length > 0 ? null : `${label} wajib diisi.`;
}

/** Panjang maksimum (opsional berlaku untuk nilai kosong). */
export function validateMaxLength(value: string, max: number, label: string): string | null {
  return value.length <= max ? null : `${label} maksimal ${max} karakter.`;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Email wajib diisi.';
  }
  return EMAIL_PATTERN.test(trimmed) ? null : 'Format email tidak valid.';
}

export function validatePassword(value: string): string | null {
  if (value.length === 0) {
    return 'Password wajib diisi.';
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  if (confirmation.length === 0) {
    return 'Konfirmasi password wajib diisi.';
  }
  return password === confirmation ? null : 'Konfirmasi password tidak sama.';
}

/** Phone opsional: kosong = valid; jika diisi harus pola nomor telepon. */
export function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return PHONE_PATTERN.test(trimmed) ? null : 'Nomor telepon tidak valid.';
}

/** Input amount dalam bentuk string hasil format (boleh ada titik). */
export function validateAmount(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Nominal wajib diisi.';
  }
  const digits = trimmed.replace(/\./g, '').replace(/[^\d-]/g, '');
  if (digits.length === 0 || !/^-?\d+$/.test(digits)) {
    return 'Nominal harus berupa angka.';
  }
  if (Number(digits) < 0) {
    return 'Nominal tidak boleh negatif.';
  }
  return null;
}

export function validateISODate(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Tanggal wajib diisi.';
  }
  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return 'Format tanggal harus YYYY-MM-DD.';
  }
  const [year, month, day] = trimmed.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
  return isRealDate ? null : 'Tanggal tidak valid.';
}

export function validateDateOrder(invoiceDate: string, dueDate: string): string | null {
  if (!ISO_DATE_PATTERN.test(invoiceDate.trim()) || !ISO_DATE_PATTERN.test(dueDate.trim())) {
    return null;
  }
  return dueDate.trim() >= invoiceDate.trim()
    ? null
    : 'Jatuh tempo tidak boleh sebelum tanggal invoice.';
}

/**
 * Validasi periode laporan (TB-80): start harus <= end.
 * Pesan format per-field ditangani `validateISODate`; fungsi ini hanya
 * mengecek urutan ketika kedua tanggal sudah berformat valid.
 */
export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!ISO_DATE_PATTERN.test(startDate.trim()) || !ISO_DATE_PATTERN.test(endDate.trim())) {
    return null;
  }
  return startDate.trim() <= endDate.trim()
    ? null
    : 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir.';
}

export function hasErrors(errors: FieldErrors<string>): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}

/** Buat object error hanya berisi field yang gagal (buang `undefined`). */
export function compactErrors<K extends string>(
  errors: Record<K, string | null>,
): FieldErrors<K> {
  const result: FieldErrors<K> = {};
  const entries = Object.entries(errors) as [K, string | null][];
  for (const [key, message] of entries) {
    if (message) {
      result[key] = message;
    }
  }
  return result;
}

/**
 * Membersihkan input search sebelum dipakai pada filter PostgREST `.or()`.
 * Karakter logika PostgREST dibuang agar input user tidak mengubah struktur query.
 */
export function sanitizeSearchQuery(value: string): string {
  return value
    .replace(/[(),.%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
