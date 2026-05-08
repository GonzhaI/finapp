import { router } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, exchangeModalOrbs, exchangeModalOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useCreateExchangeRate } from '@/hooks/queries/useExchangeRates';
import { supportedCurrencies } from '@/store/settingsStore';

export default function NewExchangeRateScreen() {
  const { theme, spacing, isDark } = useTheme();
  const t = useT();
  const createRate = useCreateExchangeRate();

  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('CLP');
  const [rate, setRate] = useState('');

  const currencies = supportedCurrencies;

  const handleSave = () => {
    if (!fromCurrency || !toCurrency || !rate) return;

    const id = `rate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    createRate.mutate({
      id,
      fromCurrency,
      toCurrency,
      rate: Number(rate),
      effectiveAt: Date.now(),
      createdAt: Date.now(),
    });

    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? exchangeModalOrbs : exchangeModalOrbsLight} />

      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.glassHighlight,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {t('exchangeRates.newRate')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            {t('exchangeRates.from')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {currencies.map((c) => {
              const active = fromCurrency === c.code;
              return (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => setFromCurrency(c.code)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                  }}
                >
                  <Text
                    variant="label"
                    color={active ? 'white' : 'secondary'}
                    style={{ textTransform: 'none', letterSpacing: 0 }}
                  >
                    {c.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            {t('exchangeRates.to')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {currencies
              .filter((c) => c.code !== fromCurrency)
              .map((c) => {
                const active = toCurrency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => setToCurrency(c.code)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                    }}
                  >
                    <Text
                      variant="label"
                      color={active ? 'white' : 'secondary'}
                      style={{ textTransform: 'none', letterSpacing: 0 }}
                    >
                      {c.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.surfaceGlass,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.glassBorder,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>
            {t('exchangeRates.rate')}
          </Text>
          <TextInput
            value={rate}
            onChangeText={setRate}
            keyboardType="decimal-pad"
            placeholder={t('exchangeRates.example')}
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              fontSize: 17,
              color: theme.colors.text,
              paddingVertical: 0,
            }}
          />
          <Text variant="micro" color="tertiary" style={{ marginTop: 2 }}>
            1 {fromCurrency} = X {toCurrency}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!rate || !fromCurrency || !toCurrency || createRate.isPending}
          activeOpacity={0.8}
          style={{
            height: 52,
            borderRadius: 14,
            backgroundColor: theme.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !rate || !fromCurrency || !toCurrency ? 0.4 : 1,
          }}
        >
          <Text variant="button" color="white">
            {createRate.isPending ? 'Guardando...' : t('common.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
