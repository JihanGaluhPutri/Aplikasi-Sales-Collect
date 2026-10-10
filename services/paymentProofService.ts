import { File } from 'expo-file-system';

import { supabase } from '@/lib/supabase';
import { AppError } from '@/utils/error';

/**
 * Service upload & pembacaan bukti pembayaran (enhancement pasca-MVP).
 *
 * Aturan:
 * - Bucket PRIVATE `payment-proofs`; path `invoices/{invoice_id}/{nama}.{ext}`.
 * - Kepemilikan diverifikasi oleh policy storage di database (migration 013):
 *   sales hanya dapat mengunggah/membaca file invoice miliknya, admin dapat
 *   membaca semua. UI tidak pernah menjadi sumber kebenaran otorisasi.
 * - Upload WAJIB berhasil sebelum status invoice diubah ke `dibayar`
 *   (lihat invoiceService.updateInvoiceStatus) - jika upload gagal, status
 *   tidak berubah sama sekali.
 * - Menampilkan bukti menggunakan signed URL sementara, bukan URL publik.
 */
const BUCKET = 'payment-proofs';

/** Batas ukuran foto (selaras dengan file_size_limit di migration 013). */
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

/** Masa berlaku signed URL untuk menampilkan bukti (1 jam). */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export interface PickedProofImage {
  uri: string;
  mimeType: string;
  fileSize: number | null;
}

function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'jpg';
  }
}

/** Path unik per upload - nama file tidak bisa ditebak. */
export function paymentProofPathFor(invoiceId: string, mimeType: string): string {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `invoices/${invoiceId}/${unique}.${extensionFor(mimeType)}`;
}

/**
 * Upload foto bukti ke storage. MELEMPAR error jika gagal -
 * pemanggil wajib membatalkan proses status jika fungsi ini gagal.
 *
 * @returns path tersimpan (untuk disimpan ke invoices.payment_proof_path
 *          lewat RPC update_invoice_status).
 */
export async function uploadPaymentProof(
  invoiceId: string,
  image: PickedProofImage,
): Promise<string> {
  if (!invoiceId) {
    throw new AppError('validation', 'Invoice tidak valid.');
  }

  if (image.fileSize != null && image.fileSize > MAX_PROOF_BYTES) {
    throw new AppError('validation', 'Ukuran foto maksimal 5 MB. Silakan pilih foto lain.');
  }

  const mimeType = ALLOWED_IMAGE_MIME.has(image.mimeType) ? image.mimeType : 'image/jpeg';
  const path = paymentProofPathFor(invoiceId, mimeType);

  // Baca file lokal -> Uint8Array. Di React Native BOLEH membungkus body ke
  // Blob: supabase-js selalu mengubah Blob menjadi FormData, sedangkan
  // FormData native RN tidak mendukung bagian berbentuk Blob (hanya
  // string / {uri,name,type}) sehingga request gagal sebelum terkirim.
  // Uint8Array dikirim sebagai body mentah dengan content-type yang benar.
  let bytes: Uint8Array;
  try {
    const file = new File(image.uri);
    if (file.size > MAX_PROOF_BYTES) {
      throw new AppError('validation', 'Ukuran foto maksimal 5 MB. Silakan pilih foto lain.');
    }
    bytes = await file.bytes();
    if (bytes.byteLength === 0) {
      throw new AppError('validation', 'Foto tidak dapat dibaca. Silakan pilih gambar lain.');
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('network', 'Foto tidak dapat dibaca. Silakan pilih gambar lain.');
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mimeType, upsert: false });

  if (error) {
    throw new AppError('network', 'Foto gagal diunggah. Periksa internet Anda lalu coba lagi.', {
      code: error.message,
      originalError: error,
    });
  }

  return path;
}

/**
 * Hapus file bukti (best effort) - dipanggil jika update status setelah
 * upload berhasil gagal, agar tidak ada file yatim di storage.
 */
export async function deletePaymentProof(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Best effort: kegagalan cleanup tidak boleh mengganggu pesan utama.
  }
}

/** Signed URL sementara untuk menampilkan bukti pembayaran. */
export async function getPaymentProofUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new AppError('database', 'Bukti pembayaran gagal dimuat. Silakan coba lagi.');
  }

  return data.signedUrl;
}
