import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { InvoiceStatusHistory } from '@/components/InvoiceStatusHistory';
import { Loading } from '@/components/Loading';
import { PaymentProofCard } from '@/components/PaymentProofCard';
import { SalesSelector } from '@/components/SalesSelector';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { assignInvoice, deleteInvoice, getInvoiceById } from '@/services/invoiceService';
import type { InvoiceDetail } from '@/types/invoice';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';
import { getUserMessage } from '@/utils/error';

/**
 * Detail invoice admin (TB-54): seluruh field + relasi customer (TB-65)
 * + assignment sales (TB-57/58) + history (TB-64).
 *
 * Action berdasar role: admin -> Edit, Delete, Assign/Reassign.
 * Update status collection hanya dari sisi sales (TB-54, TB-62).
 */
export default function AdminInvoiceDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = id ?? '';

  const { data: invoice, loading, error, reload } = useAsync<InvoiceDetail | null>(
    () => getInvoiceById(invoiceId),
    [invoiceId],
    { refetchOnFocus: true },
  );

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    if (!invoice || deleting) {
      return;
    }
    setDeleting(true);
    deleteInvoice(invoice.id)
      .then(() => {
        toast.success('Invoice berhasil dihapus.');
        router.replace('/admin/invoices');
      })
      .catch((caught: unknown) => {
        toast.error(getUserMessage(caught));
        setConfirmVisible(false);
      })
      .finally(() => setDeleting(false));
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
            action={{ label: 'Kembali', onPress: () => router.replace('/admin/invoices') }}
            description="Invoice tidak ditemukan, sudah dihapus, atau bukan bagian dari akses Anda."
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
          <DetailRow label="Customer" value={invoice.customer?.name ?? null} />
          <DetailRow label="Sales" value={invoice.assignedSales?.name ?? 'Belum ditugaskan'} />
          <DetailRow label="Amount" value={formatCurrency(invoice.amount)} />
          <DetailRow label="Tanggal Invoice" value={formatDate(invoice.invoice_date)} />
          <DetailRow label="Jatuh Tempo" value={formatDate(invoice.due_date)} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STATUS</Text>
            <StatusBadge status={invoice.status} />
          </View>
          <DetailRow label="Notes" value={invoice.notes} />
          <DetailRow label="Dibuat" value={formatDateTime(invoice.created_at)} />
          <DetailRow label="Diperbarui" value={formatDateTime(invoice.updated_at)} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Informasi Customer</Text>
          <DetailRow label="Nama" value={invoice.customer?.name ?? null} />
          <DetailRow label="Telepon" value={invoice.customer?.phone ?? null} />
          <DetailRow label="Alamat" value={invoice.customer?.address ?? null} />
          {!invoice.customer ? (
            <Text style={styles.muted}>
              Data customer tidak tersedia (sudah dihapus atau di luar akses Anda).
            </Text>
          ) : null}
        </Card>

        <PaymentProofCard invoice={invoice} />

        {/* key me-remount section ketika `sales_id` berubah dari server,
            sehingga pilihan form selalu sinkron dengan data terbaru. */}
        <AssignmentSection
          invoice={invoice}
          key={`${invoice.id}:${invoice.sales_id ?? 'unassigned'}`}
          onSaved={reload}
        />

        <Button
          onPress={() => router.push(`/admin/invoices/${invoice.id}/edit`)}
          title="Edit Invoice"
        />
        <Button
          disabled={deleting}
          onPress={() => setConfirmVisible(true)}
          title="Hapus Invoice"
          variant="danger"
        />

        <ConfirmDialog
          cancelLabel="Batal"
          confirmLabel="Hapus"
          destructive
          loading={deleting}
          message={`Invoice ${invoice.invoice_number} beserta riwayat statusnya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
          onCancel={() => {
            if (!deleting) {
              setConfirmVisible(false);
            }
          }}
          onConfirm={handleDelete}
          title="Hapus Invoice?"
          visible={confirmVisible}
        />

        <InvoiceStatusHistory invoiceId={invoice.id} />
      </Screen>
    </>
  );
}

interface AssignmentSectionProps {
  invoice: InvoiceDetail;
  onSaved: () => Promise<void>;
}

/** Assign / reassign sales (TB-57) dengan SalesSelector (TB-58). */
function AssignmentSection({ invoice, onSaved }: AssignmentSectionProps) {
  const toast = useToast();
  const [selectedSalesId, setSelectedSalesId] = useState<string | null>(invoice.sales_id);
  const [saving, setSaving] = useState(false);

  const assignChanged = (invoice.sales_id ?? null) !== selectedSalesId;

  const handleAssign = () => {
    setSaving(true);
    assignInvoice(invoice.id, selectedSalesId)
      .then(() => {
        toast.success(
          selectedSalesId
            ? 'Penugasan sales berhasil disimpan.'
            : 'Invoice dilepas dari penugasan sales.',
        );
        return onSaved();
      })
      .catch((caught: unknown) => toast.error(getUserMessage(caught)))
      .finally(() => setSaving(false));
  };

  return (
    <Card>
      <Text style={styles.sectionTitle}>Assign / Reassign Sales</Text>
      <SalesSelector allowClear onChange={setSelectedSalesId} value={selectedSalesId} />
      <Button
        disabled={!assignChanged}
        loading={saving}
        onPress={handleAssign}
        title="Simpan Penugasan"
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  statusRow: {
    gap: spacing.xs,
  },
  statusLabel: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  muted: {
    color: colors.secondary,
    fontSize: fontSize.xs,
  },
});
