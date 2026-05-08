import { View, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { BackgroundOrbs, recurringOrbs, recurringOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useRecurringRules, useToggleRecurringRule, useDeleteRecurringRule } from '@/hooks/queries/useRecurringRules';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';
import { useHaptics } from '@/hooks/useHaptics';

const frequencyLabels: Record<string, { es: string; en: string }> = {
  '0 0 * * 1': { es: 'Semanal', en: 'Weekly' },
  '0 0 1,15 * *': { es: 'Quincenal', en: 'Biweekly' },
  '0 0 1 * *': { es: 'Mensual', en: 'Monthly' },
  '0 0 1 1 *': { es: 'Anual', en: 'Yearly' },
};

function getFrequencyLabel(cron: string, lang: string): string {
  const entry = frequencyLabels[cron];
  if (entry) return lang === 'es' ? entry.es : entry.en;
  return cron;
}

function getTemplateField(template: unknown, field: string): string {
  const tmpl = template as Record<string, unknown> | null;
  return String(tmpl?.[field] ?? '');
}

export default function RecurringScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const { data: rules, isLoading } = useRecurringRules();
  const toggle = useToggleRecurringRule();
  const deleteRule = useDeleteRecurringRule();
  const haptics = useHaptics();

  const handleDelete = (id: string) => {
    haptics.warning();
    Alert.alert(t('recurring.deleteTitle'), t('recurring.deleteDesc'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteRule.mutate(id) },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <BackgroundOrbs orbs={isDark ? recurringOrbs : recurringOrbsLight} />
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
      <BackgroundOrbs orbs={isDark ? recurringOrbs : recurringOrbsLight} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">{t('common.back')}</Text>
          </TouchableOpacity>
          <Text variant="title2">{t('recurring.title')}</Text>
          <View style={{ width: 50 }} />
        </View>
      </View>

      {!rules || rules.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title={t('recurring.empty')}
            description={t('recurring.emptyDescription')}
            action={
              <Button kind="primary" size="sm" onPress={() => router.push('/new-recurring')}>
                {t('recurring.newRule')}
              </Button>
            }
          />
        </View>
      ) : (
        <FlatList
          data={rules}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const tmpl = item.template ?? {};
            const kind = getTemplateField(tmpl, 'kind') as 'income' | 'expense';
            const amount = Number(getTemplateField(tmpl, 'amount') || 0);
            const currency = getTemplateField(tmpl, 'currency') || 'CLP';
            const note = getTemplateField(tmpl, 'note');

            return (
              <TouchableOpacity
                onPress={() => router.push(`/new-recurring?id=${item.id}`)}
                activeOpacity={0.7}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text variant="body" style={{ fontSize: 15, fontWeight: '500' }} numberOfLines={1}>
                        {note || (kind === 'income' ? 'Ingreso' : 'Gasto')}
                      </Text>
                      {!item.active && (
                        <View
                          style={{
                            backgroundColor: theme.colors.separator,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 2,
                            borderRadius: 999,
                          }}
                        >
                          <Text variant="caption" color="tertiary">
                            {t('recurring.paused')}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text variant="caption" color="tertiary">
                      {getFrequencyLabel(item.cron, 'es')} · {t('recurring.nextRun')}:{' '}
                      {formatShortDate(item.nextRunAt)}
                    </Text>
                  </View>
                  <Text
                    variant="body"
                    style={{ fontWeight: '500', marginRight: spacing.sm }}
                    color={kind === 'income' ? 'income' : 'expense'}
                  >
                    {kind === 'income' ? '+' : '-'} {formatCurrency(amount, currency)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Switch
                      value={item.active}
                      onValueChange={(v) => {
                        haptics.selection();
                        toggle.mutate({ id: item.id, active: v });
                      }}
                      trackColor={{ false: theme.colors.separator, true: theme.colors.accent }}
                      thumbColor="#FFFFFF"
                    />
                    <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={8}>
                      <Ionicons name="close" size={15} color={theme.colors.expense} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {rules && rules.length > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/new-recurring')}
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
      )}
    </SafeAreaView>
  );
}
