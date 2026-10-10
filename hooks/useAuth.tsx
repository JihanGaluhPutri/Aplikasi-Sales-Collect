import type { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import { logout } from '@/services/authService';
import { ensureCurrentProfile } from '@/services/profileService';
import type { AuthStatus } from '@/types/auth';
import type { Profile, UserRole } from '@/types/user';
import { clearSessionExpired, markSessionExpired } from '@/utils/sessionNotice';
import { getUserMessage, logError } from '@/utils/error';

/**
 * Auth Session Provider (TB-29).
 *
 * Satu-satunya sumber kebenaran untuk status authentication aplikasi:
 * AuthProvider -> Supabase session -> current user -> profile -> role.
 *
 * Perilaku:
 * - App start: restore session dari storage (AsyncStorage) tanpa flash.
 * - `status` hanya menjadi `authenticated` SETELAH profile ikut dimuat,
 *   sehingga layar tidak pernah berpindah login -> dashboard -> login lagi.
 * - Tanpa session -> `unauthenticated` -> route guard mengarahkan ke /login.
 * - Session hilang (logout) -> state ikut dibersihkan.
 * - Role diambil dari `profiles.role` di database, bukan dari input frontend.
 */

export interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  profileError: string | null;
  /** True saat user membuka link reset password (PASSWORD_RECOVERY). */
  passwordRecovery: boolean;
  /** Akhiri mode recovery (dipanggil setelah password baru tersimpan). */
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const profileRef = useRef<Profile | null>(null);
  const loadingUserIdRef = useRef<string | null>(null);

  const applySession = useCallback(async (nextSession: Session | null): Promise<void> => {
    const hadSession = sessionRef.current !== null;
    sessionRef.current = nextSession;
    setSession(nextSession);

    if (!nextSession) {
      // Session hilang BUKAN karena logout manual (token refresh gagal /
      // session dicabut) -> ditandai untuk pesan "Sesi Anda berakhir" (TB-85).
      if (hadSession) {
        markSessionExpired();
      }
      // Logout / belum login: seluruh state user lama dibersihkan.
      profileRef.current = null;
      loadingUserIdRef.current = null;
      setProfile(null);
      setProfileError(null);
      setStatus('unauthenticated');
      return;
    }

    // Session (kembali) ada -> tidak ada expiry yang perlu dilaporkan.
    clearSessionExpired();

    const userId = nextSession.user.id;

    // Profile user yang sama sudah dimuat -> tidak fetch ulang (token refresh).
    if (profileRef.current?.id === userId) {
      setStatus('authenticated');
      return;
    }

    // Proses load untuk user ini sedang berjalan - biarkan yang pertama selesai.
    if (loadingUserIdRef.current === userId) {
      return;
    }

    loadingUserIdRef.current = userId;
    setStatus('loading');

    try {
      const nextProfile = await ensureCurrentProfile();
      if (sessionRef.current?.user.id !== userId) {
        return; // session sudah berganti/gagal di tengah jalan
      }
      profileRef.current = nextProfile;
      setProfile(nextProfile);
      setProfileError(null);
      setStatus('authenticated');
    } catch (error) {
      if (sessionRef.current?.user.id !== userId) {
        return;
      }
      logError(error, 'loadProfile');
      profileRef.current = null;
      setProfile(null);
      setProfileError(getUserMessage(error));
      // Tetap `authenticated` (tanpa profile) supaya tidak terjadi loop
      // login -> dashboard -> login; layar menampilkan AuthErrorScreen.
      setStatus('authenticated');
    } finally {
      if (loadingUserIdRef.current === userId) {
        loadingUserIdRef.current = null;
      }
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const current = sessionRef.current;
    if (!current) {
      setStatus('unauthenticated');
      return;
    }
    profileRef.current = null;
    await applySession(current);
  }, [applySession]);

  const clearPasswordRecovery = useCallback(() => {
    setPasswordRecovery(false);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      logError(error, 'signOut');
    } finally {
      // Logout manual - bukan session expired (TB-85).
      clearSessionExpired();
      sessionRef.current = null;
      profileRef.current = null;
      loadingUserIdRef.current = null;
      setSession(null);
      setProfile(null);
      setProfileError(null);
      setPasswordRecovery(false);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    let active = true;
    let pendingTimeout: ReturnType<typeof setTimeout> | undefined;

    // Restore session ketika aplikasi dibuka.
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) {
          await applySession(data.session ?? null);
        }
      } catch (error) {
        logError(error, 'restoreSession');
        if (active) {
          await applySession(null);
        }
      }
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) {
        return;
      }
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
      }
      // Disediakan setelah event selesai diproses Supabase, dan TIDAK melakukan
      // panggilan Supabase lain secara sinkron di dalam callback (hindari deadlock).
      pendingTimeout = setTimeout(() => {
        if (!active) {
          return;
        }
        if (event === 'PASSWORD_RECOVERY') {
          // Ditandai dulu sebelum status jadi authenticated, supaya
          // (auth)/_layout tidak langsung melempar user ke dashboard.
          setPasswordRecovery(true);
        }
        void applySession(nextSession ?? null);
        if (event === 'PASSWORD_RECOVERY') {
          router.replace('/reset-password');
        }
      }, 0);
    });

    return () => {
      active = false;
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
      }
      authListener.subscription.unsubscribe();
    };
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      profileError,
      passwordRecovery,
      clearPasswordRecovery,
      refreshProfile,
      signOut,
    }),
    [status, session, profile, profileError, passwordRecovery, clearPasswordRecovery, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>.');
  }
  return context;
}
