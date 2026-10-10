import { router, Stack } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Loading } from '@/components/Loading';
import { MenuLink } from '@/components/MenuLink';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getSales } from '@/services/salesService';
import type { Sales } from '@/types/sales';

/**
 * Sales list (TB-45): nama, telepon, status aktif/tidak aktif,
 * dengan loading / error / empty state.
 */
export default function SalesListScreen() {
  const { data, loading, error, reload } = useAsync<Sales[]>(() => getSales(), [], {
    refetchOnFocus: true,
  });

  const rows = data ?? [];

  return (
    <>
      <Stack.Screen options={{ title: 'Sales' }} />
      <Screen scroll={false}>
        <Button onPress={() => router.push('/admin/sales/create')} title="Tambah Sales" />

        {loading ? (
          <Loading message="Memuat sales..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload()} />
        ) : rows.length === 0 ? (
          <EmptyState
            action={{ label: 'Tambah Sales', onPress: () => router.push('/admin/sales/create') }}
            description="Belum ada data sales. Tambahkan sales untuk dapat menugaskan invoice."
            title="Belum ada sales"
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={rows}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(row) => row.id}
            renderItem={({ item: row }) => (
              <MenuLink
                description={row.phone ?? 'Tanpa nomor telepon'}
                onPress={() => router.push(`/admin/sales/${row.id}`)}
                title={row.name}
                trailing={
                  <Badge
                    label={row.is_active ? 'Aktif' : 'Tidak Aktif'}
                    tone={row.is_active ? 'success' : 'secondary'}
                  />
                }
              />
            )}
            style={styles.list}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
});
