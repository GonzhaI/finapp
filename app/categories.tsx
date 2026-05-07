import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pill } from '@/components/ui/Pill';
import { useCategories } from '@/hooks/queries/useCategories';
import type { CategoryKind } from '@/types';

export default function CategoriesScreen() {
  const { theme, spacing } = useTheme();
  const [kind, setKind] = useState<CategoryKind | undefined>(undefined);
  const { data: cats } = useCategories(kind);

  const tabs: { label: string; value: CategoryKind | undefined }[] = [
    { label: 'Todos', value: undefined },
    { label: 'Gastos', value: 'expense' },
    { label: 'Ingresos', value: 'income' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text color="accent">Volver</Text>
          </TouchableOpacity>
          <Text variant="title2">Categorías</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.label} onPress={() => setKind(tab.value)}>
              <Pill
                label={tab.label}
                color={kind === tab.value ? theme.colors.accent : theme.colors.textSecondary}
                size="sm"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!cats || cats.length === 0 ? (
        <EmptyState title="Sin categorías" description="Crea categorías para organizar tus movimientos" />
      ) : (
        <FlatList
          data={cats}
          contentContainerStyle={{ padding: spacing.lg }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: item.color,
                  }}
                />
                <Text variant="body">{item.name}</Text>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}
