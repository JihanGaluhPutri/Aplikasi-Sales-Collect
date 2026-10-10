import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Onboarding (UX enhancement): ditampilkan sekali sebelum user pertama
 * kali masuk ke Login/Register. Status disimpan di AsyncStorage per device.
 */
export const ONBOARDING_SEEN_KEY = 'sc_onboarding_seen';

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === '1';
  } catch {
    // Gagal membaca storage -> anggap belum pernah melihat (onboarding
    // tetap tampil, tidak memblokir aplikasi).
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1');
  } catch {
    // Best effort: jika gagal, onboarding akan tampil lagi berikutnya.
  }
}
