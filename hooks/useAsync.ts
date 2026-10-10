import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getUserMessage } from '@/utils/error';

interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

interface UseAsyncOptions {
  /**
   * Refetch otomatis setiap screen kembali fokus (mis. setelah create/edit
   * selesai dan user kembali ke list). Fetch pertama tetap berjalan saat mount.
   */
  refetchOnFocus?: boolean;
}

/**
 * Hook generik untuk menjalankan async operation (biasanya fetch data)
 * dengan state loading, error, dan hasil yang konsisten.
 *
 * Menghindari duplikasi logic loading/error di banyak screen,
 * dan memastikan state lama tidak menimpa hasil request terbaru.
 *
 * `deps` harus berupa value sederhana (string/number/boolean/null)
 * karena dibandingkan dalam bentuk JSON.
 */
export function useAsync<T>(
  callback: () => Promise<T>,
  deps: readonly unknown[] = [],
  options?: UseAsyncOptions,
): UseAsyncResult<T> {
  const refetchOnFocus = options?.refetchOnFocus ?? false;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const callbackRef = useRef(callback);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const run = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const result = await callbackRef.current();
      if (requestIdRef.current === requestId) {
        setData(result);
      }
    } catch (caught) {
      if (requestIdRef.current === requestId) {
        setData(null);
        setError(getUserMessage(caught));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    // Dengan refetchOnFocus, fetch pertama ditangani oleh focus effect di bawah
    // supaya tidak terjadi double fetch saat mount.
    if (refetchOnFocus && isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }

    // Fetch dijadwalkan setelah effect selesai, sehingga perubahan
    // state (loading/error/data) tidak dilakukan secara sinkron di dalam
    // body effect. Cleanup mencegah fetch dimulai setelah unmount.
    const timeout = setTimeout(() => {
      void run();
    }, 0);

    return () => clearTimeout(timeout);
  }, [run, depsKey, refetchOnFocus]);

  useFocusEffect(
    useCallback(() => {
      if (!refetchOnFocus) {
        return;
      }
      void run();
    }, [refetchOnFocus, run]),
  );

  return { data, loading, error, reload: run };
}
