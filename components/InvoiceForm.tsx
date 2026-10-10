import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CustomerSelector } from '@/components/CustomerSelector';
import { Input } from '@/components/Input';
import { SalesSelector } from '@/components/SalesSelector';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { Customer } from '@/types/customer';
import type { InvoiceDetail, InvoiceInput } from '@/types/invoice';
import { getUserMessage } from '@/utils/error';
import { formatCurrency } from '@/utils/currency';
import {
  compactErrors,
  FieldErrors,
  hasErrors,
  MAX_INVOICE_NUMBER_LENGTH,
  MAX_NOTES_LENGTH,
  validateAmount,
  validateDateOrder,
  validateISODate,
  validateMaxLength,
  validateRequired,
} from '@/utils/validation';

type InvoiceFormKey =
  | 'invoice_number'
  | 'customer_id'
  | 'amount'
  | 'invoice_date'
  | 'due_date'
  | 'notes';

export interface InvoiceFormProps {
  /** Data awal untuk edit (TB-55); null/undefined untuk tambah baru (TB-53). */
  initialValue?: InvoiceDetail | null;
  submitLabel: string;
  /** Dipanggil setelah validasi lolos; throw menampilkan error form. */
  onSubmit: (input: InvoiceInput) => Promise<void>;
}

/**
 * Form invoice untuk tambah & edit (TB-53, TB-55).
 *
 * - Status TIDAK pernah menjadi field form - status default `belum_ditagih`
 *   ditentukan database dan hanya berubah lewat flow status khusus.
 * - Amount disimpan sebagai angka; format Rupiah hanya untuk display (TB-67).
 * - Tanggal memakai input `YYYY-MM-DD` sehingga tidak bergeser timezone (TB-66).
 */
export function InvoiceForm({ initialValue, submitLabel, onSubmit }: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(initialValue?.invoice_number ?? '');
  const [customer, setCustomer] = useState<Customer | null>(initialValue?.customer ?? null);
  const [amountDigits, setAmountDigits] = useState(
    initialValue ? String(initialValue.amount) : '',
  );
  const [invoiceDate, setInvoiceDate] = useState(initialValue?.invoice_date ?? '');
  const [dueDate, setDueDate] = useState(initialValue?.due_date ?? '');
  const [salesId, setSalesId] = useState<string | null>(initialValue?.sales_id ?? null);
  const [notes, setNotes] = useState(initialValue?.notes ?? '');
  const [errors, setErrors] = useState<FieldErrors<InvoiceFormKey>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amountNumber = amountDigits.length > 0 ? Number(amountDigits) : 0;

  const handleAmountChange = (value: string) => {
    setAmountDigits(value.replace(/[^\d]/g, ''));
  };

  const handleSubmit = () => {
    const nextErrors = compactErrors<InvoiceFormKey>({
      invoice_number:
        validateRequired(invoiceNumber, 'Nomor invoice') ??
        validateMaxLength(invoiceNumber, MAX_INVOICE_NUMBER_LENGTH, 'Nomor invoice'),
      customer_id: customer ? null : 'Customer wajib dipilih.',
      amount: validateAmount(amountDigits),
      invoice_date: validateISODate(invoiceDate),
      due_date: validateDateOrder(invoiceDate, dueDate) ?? validateISODate(dueDate),
      notes: validateMaxLength(notes, MAX_NOTES_LENGTH, 'Notes'),
    });

    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors) || !customer) {
      return;
    }

    setSubmitting(true);
    void onSubmit({
      invoice_number: invoiceNumber.trim(),
      customer_id: customer.id,
      sales_id: salesId,
      amount: Number(amountDigits),
      invoice_date: invoiceDate.trim(),
      due_date: dueDate.trim(),
      notes: notes.trim() ? notes.trim() : null,
    })
      .catch((caught: unknown) => setFormError(getUserMessage(caught)))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Input
        autoCapitalize="characters"
        error={errors.invoice_number}
        label="Nomor Invoice*"
        maxLength={MAX_INVOICE_NUMBER_LENGTH}
        onChangeText={setInvoiceNumber}
        placeholder="Contoh: INV-001"
        value={invoiceNumber}
      />

      <CustomerSelector
        error={errors.customer_id}
        onSelect={setCustomer}
        value={customer}
      />

      <View style={styles.amountGroup}>
        <Input
          error={errors.amount}
          keyboardType="number-pad"
          label="Amount*"
          maxLength={15}
          onChangeText={handleAmountChange}
          placeholder="Contoh: 1500000"
          value={amountDigits}
        />
        {amountDigits.length > 0 && !errors.amount ? (
          <Text style={styles.amountPreview}>{formatCurrency(amountNumber)}</Text>
        ) : null}
      </View>

      <Input
        autoCapitalize="none"
        error={errors.invoice_date}
        keyboardType="numbers-and-punctuation"
        label="Tanggal Invoice*"
        maxLength={10}
        onChangeText={setInvoiceDate}
        placeholder="YYYY-MM-DD"
        value={invoiceDate}
      />

      <Input
        autoCapitalize="none"
        error={errors.due_date}
        keyboardType="numbers-and-punctuation"
        label="Jatuh Tempo*"
        maxLength={10}
        onChangeText={setDueDate}
        placeholder="YYYY-MM-DD"
        value={dueDate}
      />

      <SalesSelector
        allowClear
        label="Sales"
        onChange={setSalesId}
        value={salesId}
      />

      <Input
        error={errors.notes}
        label="Notes"
        maxLength={MAX_NOTES_LENGTH}
        multiline
        onChangeText={setNotes}
        placeholder="Catatan (opsional)"
        value={notes}
      />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Button loading={submitting} onPress={handleSubmit} title={submitLabel} />
    </>
  );
}

const styles = StyleSheet.create({
  amountGroup: {
    gap: spacing.xs,
  },
  amountPreview: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  formError: {
    color: colors.danger,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
