import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import { useI18nStore, type Locale } from '@/store/i18nStore';

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

const langOptions: { label: string; value: Locale }[] = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

export default function SettingsScreen() {
  const { theme, spacing } = useTheme();
  const t = useT();
  const { mode, setMode } = useThemeStore();
  const { locale, setLocale } = useI18nStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <Text variant="title1">{t('settings.title')}</Text>

        {/* Cuentas y Categorías */}
        <Card>
          <TouchableOpacity
            onPress={() => router.push('/accounts')}
            style={{ paddingVertical: spacing.sm }}
          >
            <Text variant="body">Cuentas</Text>
            <Text variant="caption" color="tertiary">
              Gestiona tus cuentas bancarias, efectivo y más
            </Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <TouchableOpacity
            onPress={() => router.push('/categories')}
            style={{ paddingVertical: spacing.sm }}
          >
            <Text variant="body">Categorías</Text>
            <Text variant="caption" color="tertiary">
              Organiza tus gastos e ingresos
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Tema */}
        <View>
          <Text variant="subhead" color="secondary" style={{ marginBottom: spacing.sm }}>
            {t('settings.theme')}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setMode(opt.value)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: 999,
                  backgroundColor: mode === opt.value ? theme.colors.accent : theme.colors.surface,
                  alignItems: 'center',
                }}
              >
                <Text variant="subhead" color={mode === opt.value ? 'inverse' : 'secondary'}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Idioma */}
        <View>
          <Text variant="subhead" color="secondary" style={{ marginBottom: spacing.sm }}>
            {t('settings.language')}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {langOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setLocale(opt.value as Locale)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: 999,
                  backgroundColor: locale === opt.value ? theme.colors.accent : theme.colors.surface,
                  alignItems: 'center',
                }}
              >
                <Text variant="subhead" color={locale === opt.value ? 'inverse' : 'secondary'}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info */}
        <Card>
          <Text variant="caption" color="tertiary" align="center">
            finapp v1.0.0 — Local-first · Sin servidor · Privacidad total
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
