import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
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
  const { theme, spacing } = useTheme();
  const { data: accts, isLoading } = useAccounts();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={70} />
          <Skeleton height={70} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text color="accent">Volver</Text>
          </TouchableOpacity>
          <Text variant="title2">Cuentas</Text>
          <View style={{ width: 50 }} />
        </View>
      </View>

      {!accts || accts.length === 0 ? (
        <EmptyState title="Sin cuentas" description="Crea tu primera cuenta para empezar" />
      ) : (
        <FlatList
          data={accts}
          contentContainerStyle={{ padding: spacing.lg }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const balance = getAccountBalance(item.id);
            return (
              <Card style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{item.name}</Text>
                    <Text variant="caption" color="tertiary">
                      {item.provider ?? kindLabels[item.kind] ?? item.kind}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="body" color={balance >= 0 ? 'income' : 'expense'}>
                      {formatCurrency(balance, item.currency)}
                    </Text>
                    {item.kind === 'credit' && item.creditLimit && (
                      <Text variant="caption" color="tertiary">
                        Límite: {formatCurrency(item.creditLimit, item.currency)}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
