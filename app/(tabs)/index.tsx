import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';

export default function HomeScreen() {
  const { theme, spacing } = useTheme();
  const t = useT();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* Header */}
        <View>
          <Text variant="display">{t('home.title')}</Text>
          <Text variant="subhead" color="secondary">
            {t('home.subtitle')}
          </Text>
        </View>

        {/* Saldo total */}
        <Card>
          <Text variant="caption" color="tertiary">
            {t('home.totalBalance')}
          </Text>
          <Text variant="display" style={{ marginTop: spacing.xs }}>
            $ 0
          </Text>
        </Card>

        {/* Ingresos / Gastos */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" color="tertiary">
              {t('home.income')}
            </Text>
            <Text variant="title3" color="income" style={{ marginTop: spacing.xs }}>
              + $ 0
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" color="tertiary">
              {t('home.expense')}
            </Text>
            <Text variant="title3" color="expense" style={{ marginTop: spacing.xs }}>
              - $ 0
            </Text>
          </Card>
        </View>

        {/* Glass card placeholder */}
        <GlassCard>
          <Text variant="subhead" color="secondary">
            Próximos cobros
          </Text>
          <Text variant="body" color="tertiary" style={{ marginTop: spacing.xs }}>
            No hay cobros programados
          </Text>
        </GlassCard>
      </View>
    </SafeAreaView>
  );
}
