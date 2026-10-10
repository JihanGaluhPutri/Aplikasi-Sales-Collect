import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

/**
 * Empty state untuk kondisi "belum ada data".
 * Jangan gunakan component ini untuk kondisi error (gunakan ErrorState).
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>0</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {action ? (
        <Button onPress={action.onPress} style={styles.action} title={action.label} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  iconText: {
    color: colors.secondary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  description: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 200,
  },
});
