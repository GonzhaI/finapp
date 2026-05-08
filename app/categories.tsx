import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { BackgroundOrbs, categoriesOrbs, categoriesOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useCategories } from '@/hooks/queries/useCategories';
import type { CategoryKind } from '@/types';

export default function CategoriesScreen() {
  const { theme, spacing, radii, isDark } = useTheme();
  const [kind, setKind] = useState<CategoryKind | undefined>(undefined);
  const { data: cats } = useCategories(kind);

  const tabs: { label: string; value: CategoryKind | undefined }[] = [
    { label: 'Todos', value: undefined },
    { label: 'Gastos', value: 'expense' },
    { label: 'Ingresos', value: 'income' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? categoriesOrbs : categoriesOrbsLight} />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">Volver</Text>
          </TouchableOpacity>
          <Text variant="title2">Categorías</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
          {tabs.map((tab) => {
            const active = kind === tab.value;
            return (
              <TouchableOpacity
                key={tab.label}
                onPress={() => setKind(tab.value)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                }}
              >
                <Text variant="caption" color={active ? 'white' : 'secondary'}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!cats || cats.length === 0 ? (
        <EmptyState
          title="Sin categorías"
          description="Crea categorías para organizar tus movimientos"
        />
      ) : (
        <FlatList
          data={cats}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: theme.colors.surface,
                borderRadius: radii.card18,
                padding: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                }}
              />
              <Text variant="body" style={{ fontSize: 15, fontWeight: '400' }}>
                {item.name}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
