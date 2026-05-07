import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { getTotalBalance, getTotalsInRange, getMonthRange } from '@/services/balances';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeDay } from '@/utils/date';

export default function HomeScreen() {
  const { theme, spacing } = useTheme();
  const t = useT();
  const { data: accts } = useAccounts();
  const { data: txns } = useTransactions(5);
  const primaryCurrency = 'CLP';

  const totalBalance = getTotalBalance();
  const { from, to } = getMonthRange();
  const { income, expense } = getTotalsInRange(from, to);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* Header */}
        <View>
          <Text variant="display">{t('home.title')}</Text>
        </View>

        {/* Saldo total */}
        <Card>
          <Text variant="caption" color="tertiary">
            {t('home.totalBalance')}
          </Text>
          <Text variant="display" style={{ marginTop: spacing.xs }}>
            {formatCurrency(totalBalance, primaryCurrency)}
          </Text>
        </Card>

        {/* Ingresos / Gastos del mes */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" color="tertiary">
              {t('home.income')}
            </Text>
            <Text variant="title3" color="income" style={{ marginTop: spacing.xs }}>
              {formatCurrency(income, primaryCurrency)}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" color="tertiary">
              {t('home.expense')}
            </Text>
            <Text variant="title3" color="expense" style={{ marginTop: spacing.xs }}>
              {formatCurrency(expense, primaryCurrency)}
            </Text>
          </Card>
        </View>

        {/* Cuentas */}
        <View>
          <Text variant="title3" style={{ marginBottom: spacing.md }}>
            Cuentas
          </Text>
          {accts && accts.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {accts.map((a) => (
                <Card key={a.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text variant="body">{a.name}</Text>
                      <Text variant="caption" color="tertiary">
                        {a.provider ?? a.kind}
                      </Text>
                    </View>
                    <Text variant="body">
                      {formatCurrency(
                        (a.initialBalance ?? 0) +
                          (a.kind !== 'credit' ? 0 : 0),
                        a.currency,
                      )}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card>
              <Text variant="subhead" color="tertiary">
                No hay cuentas registradas
              </Text>
            </Card>
          )}
        </View>

        {/* Últimos movimientos */}
        <View>
          <Text variant="title3" style={{ marginBottom: spacing.md }}>
            Últimos movimientos
          </Text>
          {txns && txns.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              {txns.map((tx) => (
                <Card key={tx.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" numberOfLines={1}>
                        {tx.note ?? tx.kind}
                      </Text>
                      <Text variant="caption" color="tertiary">
                        {formatRelativeDay(tx.occurredAt)}
                      </Text>
                    </View>
                    <Text
                      variant="body"
                      color={tx.kind === 'income' ? 'income' : 'expense'}
                    >
                      {tx.kind === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(tx.amount, tx.currency)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Card>
              <Text variant="subhead" color="tertiary">
                {t('home.noData')}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB — Nuevo movimiento */}
      <Link href="/new-transaction" asChild>
        <TouchableOpacity
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
          <Text variant="title2" color="inverse">
            +
          </Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
