import { Badge } from '@/components/Badge';
import { INVOICE_STATUS_META } from '@/constants/status';
import type { InvoiceStatus } from '@/types/invoice';

export interface StatusBadgeProps {
  status: InvoiceStatus;
}

/**
 * Status badge seragam untuk semua layar (TB-68).
 * Label & warna diambil dari `constants/status.ts` - tidak ada warna
 * status yang di-hardcode di screen.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = INVOICE_STATUS_META[status];
  return <Badge label={meta.label} tone={meta.tone} />;
}
