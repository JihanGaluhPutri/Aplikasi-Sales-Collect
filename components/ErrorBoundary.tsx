import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { logError } from '@/utils/error';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Global error boundary (TB-85) - menangkap crash render yang tidak
 * tertangani sehingga user hanya melihat pesan ramah, bukan stack trace.
 *
 * "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    logError(error, 'ErrorBoundary');
    if (__DEV__) {
      console.warn('[SalesCollect] component stack', errorInfo.componentStack);
    }
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Terjadi kesalahan</Text>
          <Text style={styles.message}>
            Terjadi kesalahan yang tidak terduga. Silakan coba lagi.
          </Text>
          <Button onPress={this.handleReset} title="Coba Lagi" />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  message: {
    color: colors.secondary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
