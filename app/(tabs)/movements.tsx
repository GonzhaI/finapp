import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MovementsScreen() {
  const { theme } = useTheme();
  const t = useT();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <EmptyState
        title={t('movements.empty')}
        description={t('movements.emptyDescription')}
      />
    </SafeAreaView>
  );
}
