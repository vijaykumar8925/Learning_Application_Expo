import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/core/components/ErrorBoundary';
import { ContainerProvider, getAppContainer } from '../src/core/container';
import { colors, radii, spacing, typography } from '../src/core/theme';

export default function RootLayout() {
  const [authStatus, setAuthStatus] = useState<
    'checking' | 'authenticated' | 'unauthenticated'
  >('checking');

  useEffect(() => {
    let isMounted = true;
    const container = getAppContainer();

    container.authRepository
      .isAuthenticated()
      .then((isAuth) => {
        if (isMounted) {
          setAuthStatus(isAuth ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthStatus('unauthenticated');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep splash/loading gate visible until token check resolves
  if (authStatus === 'checking') {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="dark" />
        <View style={styles.splashBadge}>
          <Text style={styles.splashIcon}>⚡</Text>
        </View>
        <Text style={styles.splashTitle}>Learning Dashboard</Text>
        <Text style={styles.splashSubtitle}>Initializing application...</Text>
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.splashSpinner}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ContainerProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName={authStatus === 'authenticated' ? '(app)' : 'login'}
          >
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </ContainerProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  splashBadge: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  splashIcon: {
    fontSize: 32,
  },
  splashTitle: {
    ...typography.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  splashSubtitle: {
    ...typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  splashSpinner: {
    marginTop: spacing.sm,
  },
});
