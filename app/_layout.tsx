import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ToastProvider';
import { colors } from '@/constants/theme';
import { AuthProvider } from '@/hooks/useAuth';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={appTheme}>
          <ErrorBoundary>
            <AuthProvider>
              <ToastProvider>
                <Stack
                  screenOptions={{
                    contentStyle: { backgroundColor: colors.background },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text,
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="dark" />
              </ToastProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
