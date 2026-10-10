/**
 * Util currency (TB-67).
 *
 * Database menyimpan `amount` sebagai numeric (angka), bukan string display.
 * Format Rupiah HANYA dibuat saat ditampilkan ke user.
 * Contoh: 1500000 -> "Rp1.500.000"
 */

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const amount = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(amount)) {
    return '-';
  }

  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${sign}Rp${digits}`;
}

/**
 * Mengubah input user (boleh sudah diformat `1.500.000`) menjadi angka.
 * Mengembalikan `null` jika tidak ada angka sama sekali.
 */
export function parseCurrencyInput(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 0) {
    return null;
  }
  return Number(digits);
}
