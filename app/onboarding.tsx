import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { markOnboardingSeen } from '@/utils/onboarding';

/**
 * Onboarding sederhana (UX enhancement): ditampilkan sekali sebelum
 * Login/Register. Menggunakan asset icon asli aplikasi (`assets/images/icon.png`)
 * yang sama dengan icon di app.json, splash, dan launcher.
 */
const FEATURES: string[] = [
  'Kelola invoice, customer, dan sales dalam satu tempat',
  'Pantau status penagihan: belum ditagih, sudah ditagih, dibayar',
  'Laporan collection per periode untuk monitoring',
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [finishing, setFinishing] = useState(false);

  const handleStart = () => {
    if (finishing) {
      return;
    }
    setFinishing(true);
    markOnboardingSeen()
      .catch(() => undefined)
      .finally(() => router.replace('/login'));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentStyle={{ paddingTop: insets.top + spacing.xl }}>
        <View style={styles.hero}>
          <Image
            contentFit="cover"
            source={require('../assets/images/icon.png')}
            style={styles.icon}
          />
          <Text style={styles.title}>SalesCollect</Text>
          <Text style={styles.tagline}>Mobile Invoice Collection Management</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Ionicons color={colors.primary} name="checkmark-circle" size={20} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Button disabled={finishing} onPress={handleStart} title="Mulai" />

        <Text style={styles.footnote}>Satu aplikasi untuk Admin dan Sales.</Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  title: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  tagline: {
    color: colors.secondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  features: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  featureRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featureText: {
    color: colors.text,
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm + 6,
  },
  footnote: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
