import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Link } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { formatCurrency } from '@/utils/currency';
import { formatRelativeDay } from '@/utils/date';

export default function MovementsScreen() {
  const { theme, spacing } = useTheme();
  const t = useT();
  const { data: txns, isLoading } = useTransactions(100);

  const grouped = useMemo(() => {
    if (!txns) return [];
    const map = new Map<string, { timestamp: number; items: typeof txns }>();
    for (const tx of txns) {
      const dateStr = formatRelativeDay(tx.occurredAt);
      if (!map.has(dateStr)) map.set(dateStr, { timestamp: tx.occurredAt, items: [] });
      map.get(dateStr)!.items.push(tx);
    }
    return Array.from(map.entries()).map(([date, group]) => ({ date, ...group }));
  }, [txns]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={60} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (!txns || txns.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <EmptyState
          title={t('movements.empty')}
          description={t('movements.emptyDescription')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <FlatList
        data={grouped}
        contentContainerStyle={{ padding: spacing.lg }}
        keyExtractor={(item) => item.date}
        renderItem={({ item: group }) => (
          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="subhead" color="secondary" style={{ marginBottom: spacing.sm }}>
              {group.date}
            </Text>
            {group.items.map((tx) => (
              <Card key={tx.id} style={{ marginBottom: spacing.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" numberOfLines={1}>
                      {tx.note ?? tx.kind}
                    </Text>
                  </View>
                  <Text variant="body" color={tx.kind === 'income' ? 'income' : 'expense'}>
                    {tx.kind === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(tx.amount, tx.currency)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      />

      {/* FAB */}
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
