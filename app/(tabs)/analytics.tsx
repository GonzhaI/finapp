import { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { BackgroundOrbs, analyticsOrbs, analyticsOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useSettingsStore } from '@/store/settingsStore';
import {
  getExpensesByCategory,
  getMonthlySummary,
} from '@/services/analytics';
import { getTotalsInRange } from '@/services/balances';
import { formatCurrency } from '@/utils/currency';
import { useTransactions } from '@/hooks/queries/useTransactions';

type Period = 'thisMonth' | 'lastMonth' | '3months' | '6months' | '12months';

function getPeriodRange(period: Period): { from: number; to: number } {
  const now = new Date();
  switch (period) {
    case 'thisMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
        to: now.getTime(),
      };
    case 'lastMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime(),
      };
    case '3months':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime(),
        to: now.getTime(),
      };
    case '6months':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime(),
        to: now.getTime(),
      };
    case '12months':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime(),
        to: now.getTime(),
      };
  }
}

const periodLabels: Record<Period, string> = {
  thisMonth: 'Este mes',
  lastMonth: 'Mes pasado',
  '3months': 'Últimos 3 meses',
  '6months': 'Últimos 6 meses',
  '12months': 'Últimos 12 meses',
};

const DONUT_R = 60;
const DONUT_STROKE = 22;
const DONUT_C = DONUT_R * 2 + DONUT_STROKE;

export default function AnalyticsScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const t = useT();
  const [period, setPeriod] = useState<Period>('thisMonth');
  const primaryCurrency = useSettingsStore((s) => s.primaryCurrency);
  const { data: txns } = useTransactions(500);

  const { from, to } = getPeriodRange(period);
  const { income, expense } = getTotalsInRange(from, to);
  const expenseBreakdown = useMemo(
    () => getExpensesByCategory(from, to),
    [from, to],
  );
  const trendData = useMemo(() => getMonthlySummary(6), []);

  const mostExpensiveWeekday = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    if (!txns) return '';
    const byDay = new Array(7).fill(0);
    for (const tx of txns) {
      if (tx.kind !== 'expense') continue;
      if (tx.occurredAt < from || tx.occurredAt > to) continue;
      const day = new Date(tx.occurredAt).getDay();
      byDay[day] += tx.amount;
    }
    const maxDay = byDay.indexOf(Math.max(...byDay));
    return byDay[maxDay] > 0 ? dayNames[maxDay] : '';
  }, [txns, from, to]);

  const hasData = income > 0 || expense > 0;
  const hasExpenses = expenseBreakdown.length > 0;

  const donutSegments = useMemo(() => {
    if (!hasExpenses) return [];
    const circumference = 2 * Math.PI * DONUT_R;
    let offset = 0;
    return expenseBreakdown.map((cat) => {
      const pct = cat.percentage / 100;
      const dashLength = circumference * pct;
      const seg = { ...cat, circumference, dashLength, offset };
      offset += dashLength;
      return seg;
    });
  }, [expenseBreakdown, hasExpenses]);

  const trendPath = useMemo(() => {
    if (trendData.length < 2) return '';
    const w = 280;
    const h = 50;
    const pad = 8;
    const points = trendData.map((m, i) => ({
      x: pad + ((w - pad * 2) * i) / (trendData.length - 1),
      y: h - pad - (m.expense > 0 ? ((m.expense / Math.max(...trendData.map((d) => d.expense), 1)) * (h - pad * 2)) : 0),
    }));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [trendData]);

  const trendFillPath = useMemo(() => {
    if (!trendPath) return '';
    return `${trendPath} L ${280 - 8} ${50 - 8} L ${8} ${50 - 8} Z`;
  }, [trendPath]);

  const avgExpense = useMemo(
    () =>
      trendData.reduce((s, m) => s + m.expense, 0) / (trendData.length || 1),
    [trendData],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? analyticsOrbs : analyticsOrbsLight} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="screenTitle">{t('analytics.title')}</Text>
          <TouchableOpacity
            onPress={() => {
              const keys = Object.keys(periodLabels) as Period[];
              const idx = keys.indexOf(period);
              setPeriod(keys[(idx + 1) % keys.length]);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: radii.pill,
              backgroundColor: theme.colors.glassFill08,
              borderWidth: 1,
              borderColor: theme.colors.glassHighlight,
            }}
          >
            <Ionicons name="calendar" size={14} color={theme.colors.textSecondary} />
            <Text variant="label" color="secondary" style={{ textTransform: 'none', letterSpacing: 0 }}>
              {periodLabels[period]}
            </Text>
          </TouchableOpacity>
        </View>

        {!hasData ? (
          <Card>
            <Text variant="subhead" color="tertiary" align="center">
              {t('analytics.noExpenses')}
            </Text>
          </Card>
        ) : (
          <>
            {/* Donut Chart */}
            {hasExpenses ? (
              <View style={{ alignItems: 'center' }}>
                <Svg width={DONUT_C} height={DONUT_C}>
                  {donutSegments.map((seg, i) => (
                    <Circle
                      key={i}
                      cx={DONUT_C / 2}
                      cy={DONUT_C / 2}
                      r={DONUT_R}
                      stroke={seg.categoryColor}
                      strokeWidth={DONUT_STROKE}
                      strokeDasharray={`${seg.dashLength} ${seg.circumference - seg.dashLength}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                      fill="none"
                      transform={`rotate(-90 ${DONUT_C / 2} ${DONUT_C / 2})`}
                    />
                  ))}
                </Svg>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="title3">
                    {formatCurrency(expense, primaryCurrency)}
                  </Text>
                  <Text variant="micro" color="tertiary">
                    Total gastado
                  </Text>
                </View>
              </View>
            ) : (
              <Card>
                <Text variant="subhead" color="tertiary" align="center">
                  {t('analytics.noExpenses')}
                </Text>
              </Card>
            )}

            {/* Category Legend */}
            {hasExpenses && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {expenseBreakdown.map((cat, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      backgroundColor: theme.colors.glassFill05,
                      borderRadius: radii.item,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderWidth: 1,
                      borderColor: theme.colors.borderLight,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: cat.categoryColor,
                      }}
                    />
                    <Text variant="label" color="secondary">
                      {cat.categoryName}
                    </Text>
                    <Text variant="label">
                      {cat.percentage.toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Trend Line Chart */}
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: radii.card18,
                padding: spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
                <Text variant="label10" color="mutedAlt">
                  TENDENCIA DE GASTO
                </Text>
                <Text variant="micro" color="tertiary">
                  Prom. {formatCurrency(Math.round(avgExpense), primaryCurrency)}/mes
                </Text>
              </View>
              <Svg width={280} height={50}>
                <Path d={trendFillPath} fill={theme.colors.accentBackground} />
                <Path
                  d={trendPath}
                  stroke={theme.colors.accent}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {trendData.length > 0 && (
                  <Circle
                    cx={280 - 8}
                    cy={
                      50 -
                      8 -
                      (trendData[trendData.length - 1].expense > 0
                        ? ((trendData[trendData.length - 1].expense /
                            Math.max(...trendData.map((d) => d.expense), 1)) *
                          (50 - 16))
                        : 0)
                    }
                    r={3.5}
                    fill={theme.colors.accent}
                  />
                )}
              </Svg>
            </View>

            {/* Insight Cards */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {/* Día más caro */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surface,
                  borderRadius: radii.card16,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text variant="label10" color="mutedAlt">
                  Día más caro
                </Text>
                <Text variant="statValue" style={{ marginTop: spacing.xs }}>
                  {mostExpensiveWeekday || '—'}
                </Text>
                {hasExpenses && (
                  <Text variant="micro" color="warning" style={{ marginTop: 2 }}>
                    ↑ {expenseBreakdown[0].percentage.toFixed(0)}% del gasto
                  </Text>
                )}
              </View>

              {/* Ahorro */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surface,
                  borderRadius: radii.card16,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text variant="label10" color="mutedAlt">
                  Ahorro mensual
                </Text>
                <Text variant="statValue" style={{ marginTop: spacing.xs }}>
                  {formatCurrency(Math.max(0, income - expense), primaryCurrency)}
                </Text>
                <Text variant="micro" color="income" style={{ marginTop: 2 }}>
                  {income > 0 ? `↑ ${((1 - expense / income) * 100).toFixed(0)}% del ingreso` : '—'}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
