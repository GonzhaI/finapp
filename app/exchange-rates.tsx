import { View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackgroundOrbs, exchangeRatesOrbs, exchangeRatesOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useExchangeRates, useDeleteExchangeRate } from '@/hooks/queries/useExchangeRates';
import { formatShortDate } from '@/utils/date';
import { useHaptics } from '@/hooks/useHaptics';

export default function ExchangeRatesScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const { data: rates, isLoading } = useExchangeRates();
  const deleteRate = useDeleteExchangeRate();
  const haptics = useHaptics();

  const handleDelete = (id: string) => {
    haptics.warning();
    Alert.alert(t('common.delete'), t('exchangeRates.emptyDescription'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteRate.mutate(id) },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <BackgroundOrbs orbs={isDark ? exchangeRatesOrbs : exchangeRatesOrbsLight} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={60} />
          <Skeleton height={60} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? exchangeRatesOrbs : exchangeRatesOrbsLight} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">{t('common.back')}</Text>
          </TouchableOpacity>
          <Text variant="title2">{t('exchangeRates.title')}</Text>
          <View style={{ width: 50 }} />
        </View>
      </View>

      {!rates || rates.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title={t('exchangeRates.empty')}
            description={t('exchangeRates.emptyDescription')}
          />
        </View>
      ) : (
        <FlatList
          data={rates}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: radii.card18,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ fontSize: 15, fontWeight: '500' }}>
                  {item.fromCurrency} → {item.toCurrency}
                </Text>
                <Text variant="caption" color="tertiary">
                  1 {item.fromCurrency} = {item.rate} {item.toCurrency}
                </Text>
                <Text variant="caption" color="tertiary">
                  {formatShortDate(item.effectiveAt)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                hitSlop={8}
                style={{ padding: 8 }}
              >
                <Ionicons name="close" size={15} color={theme.colors.expense} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/new-exchange-rate')}
        activeOpacity={0.9}
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          right: spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
