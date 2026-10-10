import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Loading } from '@/components/Loading';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getPaymentProofUrl } from '@/services/paymentProofService';
import type { Invoice } from '@/types/invoice';

export interface PaymentProofCardProps {
  invoice: Pick<Invoice, 'status' | 'payment_proof_path'>;
}

/**
 * Kartu bukti pembayaran pada detail invoice (admin & sales).
 *
 * - Belum dibayar + tanpa path -> tidak dirender (tidak mengganggu layout).
 * - Dibayar tanpa path (invoice lama / data lama migration) ->
 *   "Bukti pembayaran belum tersedia."
 * - Ada path -> tampilkan gambar lewat signed URL sementara
 *   (bucket private, tidak pernah URL publik hardcoded).
 */
export function PaymentProofCard({ invoice }: PaymentProofCardProps) {
  const path = invoice.payment_proof_path ?? null;

  const { data: signedUrl, loading, error, reload } = useAsync<string | null>(
    () => (path ? getPaymentProofUrl(path) : Promise.resolve(null)),
    [path],
    { refetchOnFocus: true },
  );

  if (!path && invoice.status !== 'dibayar') {
    return null;
  }

  if (!path) {
    return (
      <Card>
        <Text style={styles.title}>Bukti Pembayaran</Text>
        <Text style={styles.muted}>Bukti pembayaran belum tersedia.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>Bukti Pembayaran</Text>
      {loading ? (
        <Loading message="Memuat bukti pembayaran..." />
      ) : error || !signedUrl ? (
        <View style={styles.failed}>
          <Text style={styles.muted}>Bukti pembayaran gagal dimuat.</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => void reload()}>
            <Text style={styles.retry}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : (
        <Image contentFit="cover" source={{ uri: signedUrl }} style={styles.image} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  muted: {
    color: colors.secondary,
    fontSize: fontSize.sm,
  },
  failed: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  retry: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
});
