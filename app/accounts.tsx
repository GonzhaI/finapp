import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackgroundOrbs, accountsOrbs, accountsOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { getAccountBalance } from '@/services/balances';
import { formatCurrency } from '@/utils/currency';

const kindLabels: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  checking: 'Cuenta corriente',
  digital_wallet: 'Billetera digital',
  credit: 'Crédito',
  savings: 'Ahorro',
  investment: 'Inversión',
  other: 'Otro',
};

export default function AccountsScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const { data: accts, isLoading } = useAccounts();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <BackgroundOrbs orbs={isDark ? accountsOrbs : accountsOrbsLight} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={70} />
          <Skeleton height={70} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? accountsOrbs : accountsOrbsLight} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">Volver</Text>
          </TouchableOpacity>
          <Text variant="title2">Cuentas</Text>
          <View style={{ width: 50 }} />
        </View>
      </View>

      {!accts || accts.length === 0 ? (
        <EmptyState
          title="Sin cuentas"
          description="Crea tu primera cuenta para empezar"
        />
      ) : (
        <FlatList
          data={accts}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const balance = getAccountBalance(item.id);
            return (
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: radii.card18,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  marginBottom: spacing.sm,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontSize: 15, fontWeight: '500' }}>
                      {item.name}
                    </Text>
                    <Text variant="caption" color="tertiary">
                      {item.provider ?? kindLabels[item.kind] ?? item.kind}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      variant="body"
                      style={{ fontSize: 15, fontWeight: '500' }}
                      color={balance >= 0 ? 'income' : 'expense'}
                    >
                      {formatCurrency(balance, item.currency)}
                    </Text>
                    {item.kind === 'credit' && item.creditLimit && (
                      <Text variant="caption" color="tertiary">
                        Límite: {formatCurrency(item.creditLimit, item.currency)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
