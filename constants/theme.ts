/**
 * Design system SalesCollect.
 * Semua warna, spacing, radius, dan tipografi didefinisikan di sini
 * agar tidak ditulis berulang-ulang pada setiap component/screen.
 */

export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
} as const;

export type Theme = typeof theme;
