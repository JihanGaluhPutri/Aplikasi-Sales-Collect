import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '@/lib/supabase';
import type { LoginInput, RegisterInput, RegisterResult } from '@/types/auth';
import { AppError, toAppError } from '@/utils/error';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
} from '@/utils/validation';

/**
 * Service layer untuk Supabase Auth (TB-27, TB-28).
 *
 * ATURAN PROYEK:
 * - Authentication 100% ditangani Supabase Auth (register/login/logout/reset).
 * - Tidak ada custom JWT, password hashing, atau tabel password sendiri.
 * - Password tidak pernah disimpan/dikirim selain ke Supabase Auth.
 * - Semua screen memanggil service ini, bukan query Supabase langsung.
 *
 * Profile dibuat oleh trigger database `handle_new_user` (TB-36, migration 010)
 * tepat setelah user dibuat di `auth.users`; tidak ada password yang ikut
 * tersimpan di `profiles`.
 */

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Redirect URL untuk link reset password.
 * Harus didaftarkan di Supabase Dashboard > Authentication > URL Configuration
 * (Redirect URLs) agar link reset diterima.
 */
export function createPasswordResetRedirectUrl(): string {
  return Linking.createURL('reset-password');
}

/** TB-30: buat akun baru via Supabase Auth (email + password). */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const firstError =
    validateRequired(input.name, 'Nama') ??
    validateEmail(input.email) ??
    validatePassword(input.password) ??
    validatePasswordConfirmation(input.password, input.confirmPassword);

  if (firstError) {
    throw new AppError('validation', firstError);
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      // Metadata ini dibaca trigger `handle_new_user` untuk mengisi nama profile.
      data: { name: input.name.trim() },
    },
  });

  if (error) {
    throw toAppError(error);
  }

  // Ketika email confirmation aktif, email terdaftar bisa menghasilkan user
  // tanpa identities. Anggap sebagai email duplikat.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new AppError(
      'validation',
      'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      { code: 'user_already_exists' },
    );
  }

  return { requiresEmailConfirmation: data.session === null };
}

/** TB-31: login dengan email + password, mengembalikan session Supabase. */
export async function login(input: LoginInput): Promise<Session> {
  const firstError = validateEmail(input.email) ?? (input.password ? null : 'Password wajib diisi.');

  if (firstError) {
    throw new AppError('validation', firstError);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password,
  });

  if (error) {
    throw toAppError(error);
  }

  if (!data.session) {
    throw new AppError(
      'authentication',
      'Login gagal. Silakan coba lagi.',
      { code: 'session_missing' },
    );
  }

  return data.session;
}

/** TB-32: logout - session dihapus oleh Supabase dari storage perangkat. */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw toAppError(error);
  }
}

/** TB-33: kirim link reset password melalui Supabase Auth. */
export async function sendPasswordReset(email: string): Promise<void> {
  const emailError = validateEmail(email);
  if (emailError) {
    throw new AppError('validation', emailError);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: createPasswordResetRedirectUrl(),
  });

  if (error) {
    throw toAppError(error);
  }
}

/** TB-34: simpan password baru untuk session reset yang sedang aktif. */
export async function updatePassword(
  password: string,
  confirmPassword: string,
): Promise<void> {
  const firstError = validatePassword(password) ?? validatePasswordConfirmation(password, confirmPassword);

  if (firstError) {
    throw new AppError('validation', firstError);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw toAppError(error);
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw toAppError(error);
    }
    return data.session;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw toAppError(error);
    }
    return data.user;
  } catch (error) {
    throw toAppError(error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}
