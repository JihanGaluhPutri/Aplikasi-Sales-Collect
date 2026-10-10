/**
 * DTO authentication.
 * Implementasi flow authentication (register/login/logout/reset) ada di PART 2
 * dan memakai Supabase Auth - tidak pernah menyimpan password sendiri.
 */

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

/** Status state session aplikasi (TB-29). */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Hasil register: apakah user masih perlu konfirmasi email. */
export interface RegisterResult {
  requiresEmailConfirmation: boolean;
}
