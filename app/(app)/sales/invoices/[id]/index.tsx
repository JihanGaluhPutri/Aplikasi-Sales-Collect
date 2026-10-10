import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceStatusHistory } from '@/components/InvoiceStatusHistory';
import { Loading } from '@/components/Loading';
import { PaymentProofCard } from '@/components/PaymentProofCard';
import { PaymentProofDialog } from '@/components/PaymentProofDialog';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import { INVOICE_STATUS_META } from '@/constants/status';
import { useAsync } from '@/hooks/useAsync';
import { getInvoiceById, updateInvoiceStatus } from '@/services/invoiceService';
import {
  deletePaymentProof,
  uploadPaymentProof,
  type PickedProofImage,
} from '@/services/paymentProofService';
import type { InvoiceDetail, InvoiceStatus } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { getUserMessage } from '@/utils/error';

/**
 * Detail invoice sales (TB-60): data invoice + info customer
 * (nama, telepon, alamat) + update collection status (TB-61, TB-62)
 * + history (TB-64).
 *
 * Jika invoice bukan milik sales yang login, RLS mengembalikan kosong ->
 * layar menampilkan "tidak ditemukan" tanpa membocorkan data (TB-60).
 */
export default function SalesInvoiceDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = id ?? '';

  const { data: invoice, loading, error, reload } = useAsync<InvoiceDetail | null>(
    () => getInvoiceById(invoiceId),
    [invoiceId],
    { refetchOnFocus: true },
  );

  const nextStatus: InvoiceStatus | null = invoice ? INVOICE_STATUS_META[invoice.status].next : null;
  const actionLabel = invoice ? INVOICE_STATUS_META[invoice.status].actionLabel : null;

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Dialog upload bukti pembayaran - khusus transisi ke `Dibayar`.
  const [proofVisible, setProofVisible] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  /** Buka aksi status: `Dibayar` butuh foto bukti, selain itu konfirmasi biasa. */
  const handleOpenStatusAction = () => {
    if (!invoice || !nextStatus) {
      return;
    }
    if (nextStatus === 'dibayar') {
      setProofError(null);
      setProofVisible(true);
    } else {
      setConfirmVisible(true);
    }
  };

  const handleUpdateStatus = () => {
    if (!invoice || !nextStatus || updating || nextStatus === 'dibayar') {
      return;
    }

    setUpdating(true);
    updateInvoiceStatus(invoice.id, nextStatus)
      .then(() => {
        toast.success(`Status diperbarui menjadi ${INVOICE_STATUS_META[nextStatus].label}.`);
        setConfirmVisible(false);
        return reload();
      })
      .catch((caught: unknown) => {
        toast.error(getUserMessage(caught));
        setConfirmVisible(false);
      })
      .finally(() => setUpdating(false));
  };

  /**
   * Submit "Tandai Dibayar" dengan bukti:
   * upload ke storage dulu -> baru RPC update status (atomic + path).
   * Jika upload gagal, RPC tidak pernah dipanggil (status tidak berubah).
   * Jika RPC gagal setelah upload, file hasil upload dibersihkan.
   */
  const handleSubmitProof = (image: PickedProofImage) => {
    if (!invoice || updating) {
      return;
    }

    setUpdating(true);
    setProofError(null);

    void (async () => {
      let uploadedPath: string | null = null;
      try {
        uploadedPath = await uploadPaymentProof(invoice.id, image);
        await updateInvoiceStatus(invoice.id, 'dibayar', { proofPath: uploadedPath });
        toast.success('Status diperbarui menjadi Dibayar.');
        setProofVisible(false);
        await reload();
      } catch (caught: unknown) {
        if (uploadedPath) {
          // Bersihkan file upload hanya jika status ternyata TIDAK berubah
          // (mencegah file yatim; jika RPC ternyata ter-commit, file tetap ada).
          try {
            const latest = await getInvoiceById(invoice.id);
            if (latest?.status !== 'dibayar') {
              await deletePaymentProof(uploadedPath);
            }
          } catch {
            // Best effort - pesan error utama tetap ditampilkan.
          }
        }
        setProofError(getUserMessage(caught));
      } finally {
        setUpdating(false);
      }
    })();
  };

  if (loading) {
    return <Loading variant="fullscreen" />;
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => void reload()} />
      </Screen>
    );
  }

  if (!invoice) {
    return (
      <>
        <Stack.Screen options={{ title: 'Detail Invoice' }} />
        <Screen scroll={false}>
          <EmptyState
            action={{ label: 'Kembali', onPress: () => router.replace('/sales/invoices') }}
            description="Invoice tidak ditemukan atau bukan milik Anda."
            title="Invoice tidak ditemukan"
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Detail Invoice' }} />
      <Screen>
        <Card>
          <DetailRow label="Nomor Invoice" value={invoice.invoice_number} />
          <DetailRow label="Amount" value={formatCurrency(invoice.amount)} />
          <DetailRow label="Tanggal Invoice" value={formatDate(invoice.invoice_date)} />
          <DetailRow label="Jatuh Tempo" value={formatDate(invoice.due_date)} />
          <DetailRow label="Status" value={null} />
          <StatusBadge status={invoice.status} />
          <DetailRow label="Notes" value={invoice.notes} />
        </Card>

        <Card>
          <DetailRow label="Informasi Customer" value={null} />
          <DetailRow label="Nama Customer" value={invoice.customer?.name ?? null} />
          <DetailRow label="Telepon" value={invoice.customer?.phone ?? null} />
          <DetailRow label="Alamat" value={invoice.customer?.address ?? null} />
          {!invoice.customer ? (
            <DetailRow label="Catatan" value="Data customer tidak tersedia." />
          ) : null}
        </Card>

        <PaymentProofCard invoice={invoice} />

        {nextStatus && actionLabel ? (
          <>
            <Button
              disabled={updating}
              onPress={handleOpenStatusAction}
              title={actionLabel}
            />
            <ConfirmDialog
              confirmLabel={actionLabel}
              loading={updating}
              message={`Tandai invoice ${invoice.invoice_number} sebagai ${INVOICE_STATUS_META[nextStatus].label}?`}
              onCancel={() => {
                if (!updating) {
                  setConfirmVisible(false);
                }
              }}
              onConfirm={handleUpdateStatus}
              title={actionLabel}
              visible={confirmVisible && nextStatus !== 'dibayar'}
            />
            {proofVisible && nextStatus === 'dibayar' ? (
              <PaymentProofDialog
                error={proofError}
                invoiceNumber={invoice.invoice_number}
                loading={updating}
                onCancel={() => {
                  if (!updating) {
                    setProofVisible(false);
                  }
                }}
                onSubmit={handleSubmitProof}
                visible
              />
            ) : null}
          </>
        ) : (
          <Card>
            <DetailRow label="Status sudah final" value="Tidak ada aksi status berikutnya." />
          </Card>
        )}

        <InvoiceStatusHistory invoiceId={invoice.id} />
      </Screen>
    </>
  );
}
