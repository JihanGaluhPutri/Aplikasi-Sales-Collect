/**
 * Util tanggal (TB-66).
 *
 * Field bisnis `invoice_date` / `due_date` bertipe `date` (YYYY-MM-DD) di
 * database. Parsing dilakukan MANUAL agar tidak tergantung timezone device:
 * string `2026-09-01` tidak boleh bergeser menjadi `2026-08-31`.
 *
 * Format display hanya untuk UI - database tetap menyimpan date/timestamp.
 */

const MONTHS_SHORT_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format `YYYY-MM-DD` menjadi contoh: `25 Sep 2026`. */
export function formatDate(value: string | null | undefined): string {
  if (!value || !ISO_DATE_PATTERN.test(value)) {
    return '-';
  }
  const [year, month, day] = value.split('-').map(Number);
  const monthLabel = MONTHS_SHORT_ID[month - 1];
  if (!monthLabel) {
    return '-';
  }
  return `${day} ${monthLabel} ${year}`;
}

/** Format timestamp ISO menjadi contoh: `25 Sep 2026, 14.30` (waktu lokal). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  const day = date.getDate();
  const monthLabel = MONTHS_SHORT_ID[date.getMonth()];
  return `${day} ${monthLabel} ${date.getFullYear()}, ${pad2(date.getHours())}.${pad2(
    date.getMinutes(),
  )}`;
}

/** Tanggal hari ini dalam format `YYYY-MM-DD` berdasarkan waktu lokal. */
export function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** `todayISODate()` ditambah sejumlah hari (contoh: default jatuh tempo +30 hari). */
export function addDaysISODate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}
