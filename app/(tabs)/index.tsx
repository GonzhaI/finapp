import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, homeOrbs, homeOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getTotalBalance,
  getTotalsInRange,
  getMonthRange,
} from '@/services/balances';
import { getMonthlySummary } from '@/services/analytics';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeDay } from '@/utils/date';
import { useMemo } from 'react';
import type { Transaction } from '@/types';

type TransactionWithCat = Transaction & {
  categoryName?: string;
  categoryColor?: string;
};

const monthInitials = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  cart: 'cart',
  fitness: 'fitness',
  car: 'car',
  bus: 'bus',
  home: 'home',
  medical: 'medkit',
  cash: 'cash',
  card: 'card',
};

export default function HomeScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const { data: txns } = useTransactions(10);
  const { data: cats } = useCategories();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _accts = useAccounts(); // suscripción para invalidación en tiempo real
  const primaryCurrency = useSettingsStore((s) => s.primaryCurrency);

  const totalBalance = getTotalBalance();
  const { from, to } = getMonthRange();
  const { income, expense } = getTotalsInRange(from, to);

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const { from: lmFrom, to: lmTo } = getMonthRange(lastMonth);
  const { expense: lastMonthExpense } = getTotalsInRange(lmFrom, lmTo);

  const expVar =
    lastMonthExpense > 0
      ? (((expense - lastMonthExpense) / lastMonthExpense) * 100).toFixed(1)
      : '0.0';

  const monthlyData = useMemo(() => getMonthlySummary(5), []);
  const maxExp = useMemo(
    () => Math.max(...monthlyData.map((m) => m.expense), 1),
    [monthlyData],
  );

  const txnsWithCat: TransactionWithCat[] = useMemo(
    () =>
      (txns ?? []).map((tx) => {
        if (!tx.categoryId || !cats) return tx;
        const cat = cats.find((c) => c.id === tx.categoryId);
        return {
          ...tx,
          categoryName: cat?.name,
          categoryColor: cat?.color,
        };
      }),
    [txns, cats],
  );

  const getCategoryIcon = (catName?: string): keyof typeof Ionicons.glyphMap => {
    if (!catName) return 'wallet';
    const lower = catName.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lower.includes(key)) return icon;
    }
    return txnsWithCat.find((tx) => tx.categoryName === catName)?.kind === 'income'
      ? 'arrow-down'
      : 'arrow-up';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? homeOrbs : homeOrbsLight} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: 100 }}>
        {/* Hero de Saldo */}
        <View style={{ alignItems: 'flex-start', paddingTop: spacing.sm }}>
          <Text variant="caption" color="secondary">
            Balance total
          </Text>
          <Text variant="hero">
            {formatCurrency(totalBalance, primaryCurrency)}
          </Text>
          <View
            style={{
              marginTop: spacing.xs,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: theme.colors.incomeBackground,
              borderWidth: 1,
              borderColor: theme.colors.incomeBorder,
              borderRadius: radii.pill,
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
            }}
          >
            <Ionicons name="trending-up" size={12} color={theme.colors.income} />
            <Text variant="micro" color="income">
              {Number(expVar) >= 0 ? '+' : ''}{expVar}% este mes
            </Text>
          </View>
        </View>

        {/* Stats Grid 2 columnas */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {/* Ingresos */}
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceElevated,
              borderRadius: radii.card18,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: radii.iconBg,
                backgroundColor: theme.colors.incomeBackground,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Ionicons name="arrow-down" size={16} color={theme.colors.income} />
            </View>
            <Text variant="label10" color="mutedAlt">
              INGRESOS
            </Text>
            <Text variant="statValue" style={{ marginTop: 2 }}>
              {formatCurrency(income, primaryCurrency)}
            </Text>
          </View>

          {/* Gastos */}
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceElevated,
              borderRadius: radii.card18,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: radii.iconBg,
                backgroundColor: theme.colors.expenseBackground,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Ionicons name="arrow-up" size={16} color={theme.colors.expense} />
            </View>
            <Text variant="label10" color="mutedAlt">
              GASTOS
            </Text>
            <Text variant="statValue" style={{ marginTop: 2 }}>
              {formatCurrency(expense, primaryCurrency)}
            </Text>
          </View>
        </View>

        {/* Mini Gráfico de Barras Mensual */}
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: radii.card18,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text variant="label10" color="mutedAlt" style={{ marginBottom: spacing.md }}>
            Gasto mensual {new Date().getFullYear()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: 100,
            }}
          >
            {monthlyData.map((m, i) => {
              const barH = m.expense > 0 ? (m.expense / maxExp) * 70 : 4;
              const monthIdx = (new Date().getMonth() - (monthlyData.length - 1 - i) + 12) % 12;
              const isCurrent = i === monthlyData.length - 1;
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text
                    variant="micro"
                    color={isCurrent ? 'primary' : 'tertiary'}
                    style={{ marginBottom: spacing.xs }}
                  >
                    {formatCurrency(m.expense, primaryCurrency).length > 6
                      ? formatCurrency(m.expense, primaryCurrency).slice(0, 6)
                      : formatCurrency(m.expense, primaryCurrency)}
                  </Text>
                  <View
                    style={{
                      width: 28,
                      height: Math.max(barH, 4),
                      borderRadius: radii.sm,
                      backgroundColor: isCurrent
                        ? theme.colors.accent
                        : theme.colors.glassHighlight,
                    }}
                  />
                  <Text
                    variant="micro"
                    color={isCurrent ? 'primary' : 'tertiary'}
                    style={{ marginTop: spacing.xs }}
                  >
                    {monthInitials[monthIdx]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Últimos movimientos */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Text variant="itemName" color="secondary">
              Últimos movimientos
            </Text>
            <TouchableOpacity onPress={() => router.push('/movements')}>
              <Text variant="caption" color="info">
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {txnsWithCat.length > 0 ? (
            <View style={{ gap: spacing.xs }}>
              {txnsWithCat.slice(0, 5).map((tx) => {
                const iconName = getCategoryIcon(tx.categoryName);
                const iconBg =
                  tx.kind === 'income'
                    ? theme.colors.incomeBackground
                    : tx.categoryColor
                      ? `${tx.categoryColor}26`
                      : theme.colors.warningBackground;

                return (
                  <TouchableOpacity
                    key={tx.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/transaction-detail?id=${tx.id}`)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 11,
                      paddingHorizontal: 12,
                      borderRadius: radii.item,
                      backgroundColor: theme.colors.glassHighlight,
                      gap: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radii.iconRounded,
                        backgroundColor: iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={iconName}
                        size={18}
                        color={
                          tx.kind === 'income'
                            ? theme.colors.income
                            : tx.categoryColor || theme.colors.warning
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="itemName" numberOfLines={1}>
                        {tx.note || tx.categoryName || (tx.kind === 'income' ? 'Ingreso' : 'Gasto')}
                      </Text>
                      <Text variant="micro" color="tertiary">
                        {formatRelativeDay(tx.occurredAt)}
                      </Text>
                    </View>
                    <Text
                      variant="itemName"
                      color={tx.kind === 'income' ? 'income' : 'primary'}
                    >
                      {tx.kind === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: radii.card18,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text variant="subhead" color="tertiary" align="center">
                {t('home.noData')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/new-transaction')}
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
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
