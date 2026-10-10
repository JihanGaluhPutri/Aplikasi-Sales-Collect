/**
 * Error handling foundation.
 *
 * Semua error (Supabase, database, network, validation, runtime) dipetakan
 * ke satu tipe `AppError` sehingga layar cukup memanggil `getUserMessage()`
 * untuk menampilkan pesan yang aman dan konsisten ke user.
 *
 * Stack trace / pesan teknis tidak pernah ditampilkan ke user.
 */

export type AppErrorType =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'database'
  | 'network'
  | 'unknown';

export class AppError extends Error {
  readonly type: AppErrorType;
  readonly userMessage: string;
  readonly code?: string;
  readonly originalError: unknown;

  constructor(
    type: AppErrorType,
    userMessage: string,
    options?: { code?: string; originalError?: unknown },
  ) {
    super(userMessage);
    this.name = 'AppError';
    this.type = type;
    this.userMessage = userMessage;
    this.code = options?.code;
    this.originalError = options?.originalError;
  }
}

const MESSAGES: Record<AppErrorType, string> = {
  validation: 'Data tidak valid. Silakan periksa kembali isian Anda.',
  authentication: 'Sesi Anda berakhir. Silakan login kembali.',
  authorization: 'Anda tidak memiliki akses untuk melakukan aksi ini.',
  database: 'Data gagal diproses. Silakan coba lagi.',
  network: 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.',
  unknown: 'Terjadi kesalahan. Silakan coba lagi.',
};

const NETWORK_PATTERN = /network request failed|fetch failed|timed? ?out|socket hang up|aborted/i;

/** SQLSTATE yang berarti input user tidak valid. */
const VALIDATION_CODES: Record<string, string> = {
  '23502': 'Data wajib diisi belum lengkap.',
  '23503': 'Data terkait tidak ditemukan atau masih digunakan oleh data lain.',
  '23505': 'Data tersebut sudah digunakan. Silakan gunakan data lain.',
  '23514': 'Data tidak memenuhi ketentuan yang diizinkan.',
  '22P02': 'Format data tidak sesuai.',
  '22001': 'Data terlalu panjang.',
};

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email atau password salah.',
  email_exists: 'Email sudah terdaftar. Silakan gunakan email lain.',
  user_already_exists: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
  user_not_found: 'Akun tidak ditemukan.',
  user_disabled: 'Akun ini sudah dinonaktifikan. Hubungi admin.',
  email_not_confirmed:
    'Email belum dikonfirmasi. Silakan cek inbox Anda lalu gunakan link konfirmasi.',
  email_address_invalid: 'Format email tidak valid.',
  weak_password: 'Password terlalu lemah. Gunakan minimal 8 karakter.',
  validation_failed: 'Data tidak valid. Silakan periksa kembali isian Anda.',
  over_email_send_rate_limit: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
  rate_limit_exceeded: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown> | null, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown> | null, key: string): number | undefined {
  const value = record?.[key];
  return typeof value === 'number' ? value : undefined;
}

/** Mengubah error apapun menjadi AppError dengan pesan yang aman untuk user. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const record = isRecord(error) ? error : null;
  const code = readString(record, 'code');
  const message = readString(record, 'message');
  const status = readNumber(record, 'status');
  const name = readString(record, 'name');
  const isAuthError = record?.['__isAuthError'] === true;

  // Request dibatalkan (timeout TB-86 / AbortError) -> masalah koneksi.
  if (name === 'AbortError' || (message && NETWORK_PATTERN.test(message))) {
    return new AppError('network', MESSAGES.network, { code, originalError: error });
  }

  if (isAuthError) {
    const userMessage = (code && AUTH_MESSAGES[code]) || MESSAGES.authentication;
    return new AppError('authentication', userMessage, { code, originalError: error });
  }

  if (code && VALIDATION_CODES[code]) {
    return new AppError('validation', VALIDATION_CODES[code], { code, originalError: error });
  }

  if (code === '42501' || code === 'PGRST301' || status === 403) {
    return new AppError('authorization', MESSAGES.authorization, { code, originalError: error });
  }

  if (status === 401) {
    return new AppError('authentication', MESSAGES.authentication, { code, originalError: error });
  }

  // PostgrestError / error database Supabase
  if (code && (record?.['details'] !== undefined || record?.['hint'] !== undefined)) {
    return new AppError('database', MESSAGES.database, { code, originalError: error });
  }

  return new AppError('unknown', MESSAGES.unknown, { code, originalError: error });
}

/** Mendapatkan pesan error yang aman ditampilkan ke user. */
export function getUserMessage(error: unknown): string {
  return toAppError(error).userMessage;
}

/** Mendapatkan tipe error untuk kebutuhan penanganan per jenis error. */
export function getAppErrorType(error: unknown): AppErrorType {
  return toAppError(error).type;
}

/**
 * Mencatat error untuk debugging (hanya di development).
 * Tidak pernah menampilkan stack trace ke user.
 */
export function logError(error: unknown, context?: string): void {
  if (!__DEV__) {
    return;
  }

  const appError = toAppError(error);
  const label = context ? `[SalesCollect] ${context}` : '[SalesCollect]';
  const detail = appError.originalError instanceof Error ? appError.originalError.message : '';
  console.warn(`${label} ${appError.type}: ${appError.userMessage}${detail ? ` (${detail})` : ''}`);
}
