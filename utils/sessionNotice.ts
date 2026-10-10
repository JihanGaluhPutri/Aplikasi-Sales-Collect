/**
 * Penanda "session expired" (TB-85).
 *
 * Sesi yang hilang bukan karena logout manual (token refresh gagal,
 * session dicabut server, dsb.) ditandai di sini supaya route guard
 * bisa menampilkan pesan "Sesi Anda berakhir" saat mengarahkan user
 * ke Login - bukan menghilang diam-diam.
 *
 * Flag dipakai satu arah: ditandai oleh useAuth, dikonsumsi oleh
 * useRouteGuard (sekali), dan dibersihkan saat user login kembali
 * atau logout manual.
 */

let sessionExpired = false;

export function markSessionExpired(): void {
  sessionExpired = true;
}

export function clearSessionExpired(): void {
  sessionExpired = false;
}

/** Ambil & reset flag - hanya memberi efek sekali. */
export function consumeSessionExpired(): boolean {
  const value = sessionExpired;
  sessionExpired = false;
  return value;
}
