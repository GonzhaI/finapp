import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { BackgroundOrbs, settingsOrbs, settingsOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useSettingsStore, supportedCurrencies } from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';
import { useCategories } from '@/hooks/queries/useCategories';
import { useHaptics } from '@/hooks/useHaptics';
import { exportToJSON, exportToCSV, importFromJSON, clearAllData } from '@/services/backup';
import { useQueryClient } from '@tanstack/react-query';

type SettingRow = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  sub?: string;
  control: 'chevron' | 'toggle' | 'value' | 'none';
  value?: string;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const haptics = useHaptics();
  const { primaryCurrency, setPrimaryCurrency, biometricLock, setBiometricLock } =
    useSettingsStore();
  const { mode: themeMode, setMode } = useThemeStore();
  const { data: cats } = useCategories();
  const qc = useQueryClient();

  const themeModes: { value: typeof themeMode; label: string }[] = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  const handleExport = () => {
    haptics.selection();
    Alert.alert('Exportar datos', 'Elige el formato', [
      { text: 'JSON (completo)', onPress: () => exportToJSON() },
      { text: 'CSV (movimientos)', onPress: () => exportToCSV() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleImport = async () => {
    haptics.selection();
    const result = await importFromJSON();
    if (result.success) {
      qc.invalidateQueries();
      Alert.alert('Importación exitosa', 'Los datos se han restaurado correctamente.');
    } else {
      Alert.alert('Error al importar', result.error ?? 'No se pudo leer el archivo.');
    }
  };

  const handleClearAll = () => {
    haptics.warning();
    Alert.alert(
      'Borrar todos los datos',
      'Esta acción eliminará permanentemente todas las cuentas, categorías, transacciones y reglas. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            qc.invalidateQueries();
          },
        },
      ],
    );
  };

  const activeCats = cats?.filter((c) => !c.archived).length ?? 0;

  const groups: { label: string; rows: SettingRow[] }[] = [
    {
      label: 'General',
      rows: [
        {
          icon: 'cash',
          iconBg: theme.colors.warningBackground,
          iconColor: theme.colors.warning,
          label: 'Moneda',
          control: 'value',
          value: primaryCurrency,
          onPress: () => {
            haptics.selection();
            const idx = supportedCurrencies.findIndex((c) => c.code === primaryCurrency);
            const next = supportedCurrencies[(idx + 1) % supportedCurrencies.length];
            setPrimaryCurrency(next.code);
          },
        },
        {
          icon: 'pricetag',
          iconBg: theme.colors.incomeBackground,
          iconColor: theme.colors.income,
          label: t('settings.categories'),
          sub: `${activeCats} activas`,
          control: 'chevron',
          onPress: () => {
            haptics.selection();
            router.push('/categories');
          },
        },
      ],
    },
    {
      label: 'Apariencia',
      rows: [
        {
          icon: 'moon',
          iconBg: 'rgba(20,20,40,0.5)',
          iconColor: theme.colors.text,
          label: t('settings.theme'),
          control: 'value',
          value: themeModes.find((m) => m.value === themeMode)?.label ?? t('settings.themeSystem'),
          onPress: () => {
            haptics.selection();
            const idx = themeModes.findIndex((m) => m.value === themeMode);
            setMode(themeModes[(idx + 1) % themeModes.length].value);
          },
        },
      ],
    },
    {
      label: 'Seguridad',
      rows: [
        {
          icon: 'finger-print',
          iconBg: theme.colors.accentBackground,
          iconColor: theme.colors.accent,
          label: t('settings.faceId'),
          sub: t('settings.faceIdDesc'),
          control: 'toggle',
          toggleValue: biometricLock,
          onToggle: (v) => {
            haptics.selection();
            setBiometricLock(v);
          },
        },
      ],
    },
    {
      label: 'Datos',
      rows: [
        {
          icon: 'cloud-download',
          iconBg: theme.colors.incomeBackground,
          iconColor: theme.colors.income,
          label: 'Exportar datos',
          sub: 'CSV / JSON',
          control: 'chevron',
          onPress: handleExport,
        },
        {
          icon: 'cloud-upload',
          iconBg: theme.colors.infoBackground,
          iconColor: theme.colors.info,
          label: 'Importar datos',
          sub: 'Desde archivo JSON',
          control: 'chevron',
          onPress: handleImport,
        },
        {
          icon: 'trash',
          iconBg: theme.colors.expenseBackground,
          iconColor: theme.colors.expense,
          label: 'Borrar todos los datos',
          control: 'none',
          onPress: handleClearAll,
        },
      ],
    },
  ];

  const extraLinks: SettingRow[] = [
    {
      icon: 'wallet',
      iconBg: theme.colors.warningBackground,
      iconColor: theme.colors.warning,
      label: t('settings.accounts'),
      sub: t('settings.accountsDesc'),
      control: 'chevron',
      onPress: () => {
        haptics.selection();
        router.push('/accounts');
      },
    },
    {
      icon: 'repeat',
      iconBg: theme.colors.accentBackground,
      iconColor: theme.colors.accent,
      label: t('settings.recurring'),
      sub: t('settings.recurringDesc'),
      control: 'chevron',
      onPress: () => {
        haptics.selection();
        router.push('/recurring');
      },
    },
    {
      icon: 'swap-horizontal',
      iconBg: theme.colors.infoBackground,
      iconColor: theme.colors.info,
      label: t('settings.exchangeRates'),
      sub: t('settings.exchangeRatesDesc'),
      control: 'chevron',
      onPress: () => {
        haptics.selection();
        router.push('/exchange-rates');
      },
    },
  ];

  const renderRow = (row: SettingRow) => (
    <TouchableOpacity
      key={row.label}
      onPress={row.onPress}
      disabled={row.control === 'toggle'}
      activeOpacity={0.6}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 14,
        gap: spacing.md,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: radii.iconBg,
          backgroundColor: row.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={row.icon} size={16} color={row.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body">{row.label}</Text>
        {row.sub && (
          <Text variant="micro" color="tertiary">
            {row.sub}
          </Text>
        )}
      </View>
      {row.control === 'chevron' && (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
      )}
      {row.control === 'value' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Text variant="subhead" color="secondary">
            {row.value}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={theme.colors.textTertiary} />
        </View>
      )}
      {row.control === 'toggle' && (
        <Toggle value={row.toggleValue ?? false} onValueChange={row.onToggle ?? (() => {})} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? settingsOrbs : settingsOrbsLight} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: 40 }}>
        <Text variant="screenTitle">{t('settings.title')}</Text>

        {groups.map((group) => (
          <View key={group.label}>
            <Text
              variant="label10"
              color="mutedAlt"
              style={{ marginBottom: spacing.sm, paddingHorizontal: spacing.xs }}
            >
              {group.label}
            </Text>
            <View
              style={{
                borderRadius: radii.card18,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              {group.rows.map((row, idx) => (
                <View key={row.label}>
                  {idx > 0 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.colors.separator,
                        marginHorizontal: 14,
                      }}
                    />
                  )}
                  {renderRow(row)}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Extra nav links */}
        <View>
          <Text
            variant="label10"
            color="mutedAlt"
            style={{ marginBottom: spacing.sm, paddingHorizontal: spacing.xs }}
          >
            Gestión
          </Text>
          <View
            style={{
              borderRadius: radii.card18,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: 'hidden',
            }}
          >
            {extraLinks.map((row, idx) => (
              <View key={row.label}>
                {idx > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.separator,
                      marginHorizontal: 14,
                    }}
                  />
                )}
                {renderRow(row)}
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text variant="micro" color="tertiary" align="center" style={{ marginTop: spacing.sm }}>
          FinApp v1.0.0 · Modo offline
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
