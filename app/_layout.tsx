import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, AppState } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useDbMigrations } from '@/db/useMigrations';
import { seed } from '@/db/seed';
import { settingsRepo } from '@/db/repositories/settings';
import { useThemeStore } from '@/store/themeStore';
import { useI18nStore } from '@/store/i18nStore';
import { useSettingsStore } from '@/store/settingsStore';
import { execRecurringRules } from '@/services/recurring';

function AppContent() {
  const { theme, isDark } = useTheme();
  const migrationResult = useDbMigrations();
  const isHydrated = useRef(false);

  useEffect(() => {
    if (migrationResult.success) {
      seed().then(() => {
        settingsRepo.upsert({});

        const dbSettings = settingsRepo.get();
        if (dbSettings) {
          useThemeStore.getState().setAccentColor(dbSettings.accentColor);
          useThemeStore.getState().setMode(dbSettings.theme);
          if (dbSettings.language === 'es' || dbSettings.language === 'en') {
            useI18nStore.getState().setLocale(dbSettings.language);
          }
          useSettingsStore.getState().setPrimaryCurrency(dbSettings.primaryCurrency);
          useSettingsStore.getState().setLocale(dbSettings.locale);
          useSettingsStore.getState().setBiometricLock(dbSettings.biometricLock);
        }

        isHydrated.current = true;
        execRecurringRules();
      });
    }
  }, [migrationResult.success]);

  useEffect(() => {
    if (!migrationResult.success) return;

    const unsub1 = useThemeStore.subscribe((state) => {
      if (!isHydrated.current) return;
      settingsRepo.upsert({ theme: state.mode, accentColor: state.accentColor });
    });
    const unsub2 = useI18nStore.subscribe((state) => {
      settingsRepo.upsert({ language: state.locale });
    });
    const unsub3 = useSettingsStore.subscribe((state) => {
      settingsRepo.upsert({
        primaryCurrency: state.primaryCurrency,
        locale: state.locale,
        biometricLock: state.biometricLock,
      });
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [migrationResult.success]);

  const bioPendingRef = useRef(false);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState !== 'active') return;

      execRecurringRules();

      if (bioPendingRef.current) return;
      const bioEnabled = useSettingsStore.getState().biometricLock;
      if (!bioEnabled) return;

      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) return;

        bioPendingRef.current = true;
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Desbloquea finapp para continuar',
          cancelLabel: 'Cancelar',
        });

        if (!result.success && result.error === 'lockout') {
          await LocalAuthentication.authenticateAsync({
            promptMessage: 'Demasiados intentos. Usa tu código.',
            disableDeviceFallback: false,
          });
        }
      } finally {
        bioPendingRef.current = false;
      }
    });

    return () => subscription.remove();
  }, []);

  if (!migrationResult.success) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        {migrationResult.error ? (
          <Text style={{ color: theme.colors.expense }}>Error: {migrationResult.error.message}</Text>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.accent} />
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-transaction" options={{ presentation: 'modal', animation: 'fade' }} />
        <Stack.Screen name="accounts" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="recurring" options={{ headerShown: false }} />
        <Stack.Screen name="new-recurring" options={{ presentation: 'modal', animation: 'fade' }} />
        <Stack.Screen name="exchange-rates" options={{ headerShown: false }} />
        <Stack.Screen name="new-exchange-rate" options={{ presentation: 'modal', animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
