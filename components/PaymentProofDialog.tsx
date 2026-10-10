import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { MAX_PROOF_BYTES, type PickedProofImage } from '@/services/paymentProofService';

export interface PaymentProofDialogProps {
  visible: boolean;
  invoiceNumber: string;
  /** True selama upload + update status berjalan (tombol terkunci). */
  loading: boolean;
  /** Error dari proses submit (upload/status) - ditampilkan inline. */
  error?: string | null;
  onCancel: () => void;
  onSubmit: (image: PickedProofImage) => void;
}

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedProofImage {
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize ?? null,
  };
}

/**
 * Dialog "Tandai Dibayar" dengan upload foto bukti pembayaran
 * (galeri ATAU kamera). Konfirmasi hanya aktif setelah foto dipilih -
 * status invoice tidak bisa berubah tanpa bukti.
 *
 * Pola visual mengikuti ConfirmDialog (TB-87) dengan penambahan area
 * pilih/preview foto. Komponen ini di-mount/unmount oleh layar pemanggil
 * saat dialog dibuka/ditutup sehingga pilihan foto selalu di-reset.
 */
export function PaymentProofDialog({
  visible,
  invoiceNumber,
  loading,
  error,
  onCancel,
  onSubmit,
}: PaymentProofDialogProps) {
  const [image, setImage] = useState<PickedProofImage | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);

  const handleAsset = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || result.assets.length === 0) {
      return;
    }
    const asset = toPickedImage(result.assets[0]);
    if (asset.fileSize != null && asset.fileSize > MAX_PROOF_BYTES) {
      setPickError('Ukuran foto maksimal 5 MB. Silakan pilih foto lain.');
      return;
    }
    setPickError(null);
    setImage(asset);
  };

  const pickFromGallery = async () => {
    if (picking || loading) {
      return;
    }
    setPicking(true);
    setPickError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPickError('Izin akses galeri diperlukan untuk memilih foto bukti.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      handleAsset(result);
    } catch {
      setPickError('Galeri gagal dibuka. Silakan coba lagi.');
    } finally {
      setPicking(false);
    }
  };

  const takePhoto = async () => {
    if (picking || loading) {
      return;
    }
    setPicking(true);
    setPickError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPickError('Izin akses kamera diperlukan untuk mengambil foto bukti.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      handleAsset(result);
    } catch {
      setPickError('Kamera gagal dibuka. Silakan coba lagi.');
    } finally {
      setPicking(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Batal"
          accessibilityRole="button"
          onPress={loading ? undefined : onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View accessible accessibilityViewIsModal style={styles.card}>
          <Text style={styles.title}>Tandai Dibayar</Text>
          <Text style={styles.message}>
            Upload foto bukti pembayaran invoice {invoiceNumber} untuk menandainya sebagai Dibayar.
          </Text>

          {image ? (
            <View style={styles.previewWrap}>
              <Image contentFit="cover" source={{ uri: image.uri }} style={styles.preview} />
              <Text style={styles.previewHint}>Foto bukti siap diunggah.</Text>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons color={colors.secondary} name="image-outline" size={32} />
              <Text style={styles.placeholderText}>Belum ada foto dipilih</Text>
            </View>
          )}

          <View style={styles.pickRow}>
            <Button
              disabled={loading}
              loading={picking}
              onPress={pickFromGallery}
              style={styles.pickButton}
              title="Pilih Galeri"
              variant="secondary"
            />
            <Button
              disabled={loading || picking}
              onPress={takePhoto}
              style={styles.pickButton}
              title="Ambil Foto"
              variant="secondary"
            />
          </View>

          {pickError ? <Text style={styles.error}>{pickError}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button
              disabled={loading}
              onPress={onCancel}
              style={styles.action}
              title="Batal"
              variant="secondary"
            />
            <Button
              disabled={!image || picking}
              loading={loading}
              onPress={() => image && onSubmit(image)}
              style={styles.action}
              title="Tandai Dibayar"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    gap: spacing.sm,
    maxWidth: 420,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  message: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm + 6,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  placeholderText: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  previewWrap: {
    gap: spacing.xs,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  previewHint: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
  pickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickButton: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  action: {
    flex: 1,
  },
});
