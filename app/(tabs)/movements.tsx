import { View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { useI18nStore } from '@/store/i18nStore';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { BackgroundOrbs, movementsOrbs, movementsOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { useCategories } from '@/hooks/queries/useCategories';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeDay } from '@/utils/date';
import type { Transaction } from '@/types';

type Filter = 'all' | 'income' | 'expense' | 'currentMonth';

const filterLabels: Record<Filter, { es: string; en: string }> = {
  all: { es: 'Todos', en: 'All' },
  income: { es: 'Ingresos', en: 'Income' },
  expense: { es: 'Gastos', en: 'Expense' },
  currentMonth: { es: 'Este mes', en: 'This month' },
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: 'restaurant',
  alimentación: 'cart',
  supermercado: 'cart',
  trabajo: 'business',
  sueldo: 'business',
  suscripción: 'phone-portrait',
  netflix: 'phone-portrait',
  spotify: 'musical-notes',
  transporte: 'car',
  uber: 'car',
  salud: 'fitness',
  gimnasio: 'fitness',
  educación: 'school',
  ropa: 'shirt',
  ocio: 'game-controller',
  viaje: 'airplane',
  hogar: 'home',
  regalo: 'gift',
};

function getTxIcon(catName: string | null, kind: string): keyof typeof Ionicons.glyphMap {
  if (!catName) return kind === 'income' ? 'business' : 'wallet';
  const lower = catName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return kind === 'income' ? 'arrow-down' : 'cart';
}

export default function MovementsScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const { data: txns, isLoading } = useTransactions(200);
  const { data: cats } = useCategories();
  const i18nLocale = useI18nStore((s) => s.locale);
  const [filter, setFilter] = useState<Filter>('all');

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filtered = useMemo(() => {
    if (!txns) return [];
    let result = txns;
    if (filter === 'income') result = result.filter((tx) => tx.kind === 'income');
    else if (filter === 'expense') result = result.filter((tx) => tx.kind === 'expense');
    else if (filter === 'currentMonth')
      result = result.filter((tx) => tx.occurredAt >= currentMonthStart);
    return result;
  }, [txns, filter, currentMonthStart]);

  const grouped = useMemo(() => {
    const map = new Map<string, { year: number; month: number; items: Transaction[] }>();
    for (const tx of filtered) {
      const d = new Date(tx.occurredAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key))
        map.set(key, { year: d.getFullYear(), month: d.getMonth(), items: [] });
      map.get(key)!.items.push(tx);
    }
    return Array.from(map.entries()).map(([key, group]) => ({
      key,
      label: new Date(group.year, group.month).toLocaleString(i18nLocale === 'es' ? 'es' : 'en', {
        month: 'long',
        year: 'numeric',
      }),
      items: group.items.sort((a, b) => b.occurredAt - a.occurredAt),
    }));
  }, [filtered]);

  const getCategoryForTx = (tx: Transaction) => {
    if (!tx.categoryId || !cats) return null;
    return cats.find((c) => c.id === tx.categoryId) ?? null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <BackgroundOrbs orbs={isDark ? movementsOrbs : movementsOrbsLight} />
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={movementsOrbs} />

      <FlatList
        data={grouped}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.xl }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="screenTitle">{t('movements.title')}</Text>
              <TouchableOpacity
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.glassFill,
                  borderWidth: 1,
                  borderColor: theme.colors.glassHighlight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="search" size={15} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: spacing.md }}
            >
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {(Object.keys(filterLabels) as Filter[]).map((f) => {
                  const label =
                    f === 'currentMonth'
                      ? new Date().toLocaleString(i18nLocale === 'es' ? 'es' : 'en', { month: 'long' })
                      : filterLabels[f][i18nLocale];
                  const active = filter === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFilter(f)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 14,
                        borderRadius: radii.pill,
                        backgroundColor: active
                          ? theme.colors.glassFill15
                          : theme.colors.glassFill05,
                        borderWidth: 1,
                        borderColor: active
                          ? theme.colors.glassHighlight
                          : theme.colors.borderLight,
                      }}
                    >
                      <Text variant="caption" color={active ? 'primary' : 'secondary'}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('movements.empty')}
            description={t('movements.emptyDescription')}
          />
        }
        renderItem={({ item: group }) => (
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              variant="label10"
              color="mutedAlt"
              style={{ marginBottom: spacing.sm, paddingHorizontal: spacing.xs }}
            >
              {group.label}
            </Text>
            <View
              style={{
                borderRadius: radii.card20,
                backgroundColor: theme.colors.glassFill05,
                borderWidth: 1,
                borderColor: theme.colors.border,
                overflow: 'hidden',
              }}
            >
              {group.items.map((tx, idx) => {
                const cat = getCategoryForTx(tx);
                const iconName = getTxIcon(cat?.name ?? null, tx.kind);
                const iconBg =
                  tx.kind === 'income'
                    ? theme.colors.incomeBackground
                    : cat?.color
                      ? `${cat.color}26`
                      : theme.colors.warningBackground;
                const iconColor =
                  tx.kind === 'income'
                    ? theme.colors.income
                    : cat?.color || theme.colors.warning;

                return (
                  <View key={tx.id}>
                    {idx > 0 && (
                      <View
                        style={{
                          height: 1,
                          backgroundColor: theme.colors.separator,
                          marginHorizontal: spacing.lg,
                        }}
                      />
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 11,
                        paddingHorizontal: 14,
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
                        <Ionicons name={iconName} size={18} color={iconColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="itemName" numberOfLines={1}>
                          {tx.note || cat?.name || (tx.kind === 'income' ? 'Ingreso' : 'Gasto')}
                        </Text>
                        <Text variant="micro" color="tertiary">
                          {cat?.name ?? ''} {cat?.name ? '· ' : ''}{formatRelativeDay(tx.occurredAt)}
                        </Text>
                      </View>
                      <Text
                        variant="itemName"
                        color={tx.kind === 'income' ? 'income' : 'primary'}
                      >
                        {tx.kind === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/new-transaction')}
        activeOpacity={0.9}
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          alignSelf: 'center',
          width: 52,
          height: 52,
          borderRadius: 26,
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
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
