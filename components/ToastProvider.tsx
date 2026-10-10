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
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3000;

const backgroundByType: Record<ToastType, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.text,
};

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Success/error feedback sederhana (toast) untuk seluruh aplikasi.
 * Contoh: toast.success('Customer berhasil ditambahkan.').
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    Animated.timing(opacity, {
      duration: 180,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setToast(null);
      }
    });
  }, [clearTimer, opacity]);

  const show = useCallback(
    (message: string, type: ToastType = 'success') => {
      clearTimer();
      setToast({ id: Date.now(), message, type });
      opacity.setValue(0);
      Animated.timing(opacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(dismiss, TOAST_DURATION);
    },
    [clearTimer, dismiss, opacity],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message: string) => show(message, 'success'),
      error: (message: string) => show(message, 'error'),
      info: (message: string) => show(message, 'info'),
      dismiss,
    }),
    [dismiss, show],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={[
            styles.toast,
            { backgroundColor: backgroundByType[toast.type], top: insets.top + spacing.sm },
            { opacity },
          ]}
        >
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast harus digunakan di dalam <ToastProvider>.');
  }

  return context;
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    borderRadius: radius.md,
    left: spacing.md,
    maxWidth: 480,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.md,
    zIndex: 1000,
  },
  message: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
