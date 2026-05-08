import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, modalOrbs, modalOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/queries/useTransactions';
import { useCategories } from '@/hooks/queries/useCategories';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { formatCurrency, decimalToMinor } from '@/utils/currency';
import { useHaptics } from '@/hooks/useHaptics';
import type { Category, Account } from '@/types';

export default function TransactionDetailScreen() {
  const { theme, spacing, isDark } = useTheme();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tx } = useTransaction(id ?? null);
  const { data: cats } = useCategories();
  const { data: accts } = useAccounts();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [editMode, setEditMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (tx) {
      setAmount(String(tx.amount));
      setNote(tx.note ?? '');
      if (tx.categoryId && cats) {
        setSelectedCategory(cats.find((c) => c.id === tx.categoryId) ?? null);
      }
      if (accts) {
        setSelectedAccount(accts.find((a) => a.id === tx.accountId) ?? null);
      }
    }
  }, [tx, cats, accts]);

  if (!tx) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text color="tertiary">Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    haptics.warning();
    Alert.alert('Eliminar movimiento', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteTx.mutate(tx.id); router.back(); } },
    ]);
  };

  const handleSave = () => {
    if (!amount) return;
    const account = selectedAccount ?? accts?.find((a) => a.id === tx.accountId) ?? null;
    updateTx.mutate({
      id: tx.id,
      data: {
        amount: decimalToMinor(parseFloat(amount), account?.currency ?? tx.currency),
        categoryId: selectedCategory?.id ?? null,
        note: note || null,
        updatedAt: Date.now(),
      },
    });
    haptics.success();
    router.back();
  };

  const cat = cats?.find((c) => c.id === tx.categoryId);
  const acc = accts?.find((a) => a.id === tx.accountId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? modalOrbs : modalOrbsLight} />
      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.glassHighlight }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">{editMode ? 'Cancelar' : 'Cerrar'}</Text>
          </TouchableOpacity>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {editMode ? 'Editar' : 'Detalle'}
          </Text>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash" size={20} color={theme.colors.expense} />
          </TouchableOpacity>
        </View>

        {/* Tipo y fecha */}
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <View style={{
            paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999,
            backgroundColor: tx.kind === 'income' ? theme.colors.incomeBackground : theme.colors.expenseBackground,
          }}>
            <Text variant="label" color={tx.kind === 'income' ? 'income' : 'expense'} style={{ textTransform: 'none', letterSpacing: 0 }}>
              {tx.kind === 'income' ? 'Ingreso' : tx.kind === 'expense' ? 'Gasto' : 'Transferencia'}
            </Text>
          </View>
          <Text variant="caption" color="tertiary">{new Date(tx.occurredAt).toLocaleString()}</Text>
        </View>

        {/* Monto */}
        {editMode ? (
          <View>
            <Text variant="label" color="mutedAlt" align="center" style={{ marginBottom: spacing.xs }}>Monto</Text>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="rgba(255,255,255,0.2)" style={{ fontSize: 34, fontWeight: '700', color: theme.colors.text, textAlign: 'center' }} />
          </View>
        ) : (
          <Text variant="title3" align="center" color={tx.kind === 'income' ? 'income' : tx.kind === 'expense' ? 'expense' : 'primary'}>
            {tx.kind === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
          </Text>
        )}

        {/* Cuenta */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text variant="caption" color="secondary">Cuenta</Text>
          {editMode && accts ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
              {accts.map((a) => {
                const active = (selectedAccount?.id ?? tx.accountId) === a.id;
                return (
                  <TouchableOpacity key={a.id} onPress={() => setSelectedAccount(a)} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05 }}>
                    <Text variant="label" color={active ? 'white' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{a.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text variant="body">{acc?.name ?? tx.accountId}</Text>
          )}
        </View>

        {/* Categoría */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text variant="caption" color="secondary">Categoría</Text>
          {editMode && cats ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
              {cats.filter((c) => c.kind === tx.kind).map((c) => {
                const active = selectedCategory?.id === c.id;
                return (
                  <TouchableOpacity key={c.id} onPress={() => setSelectedCategory(c)} style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: active ? c.color : theme.colors.glassFill05 }}>
                    <Text variant="label" color={active ? 'white' : 'tertiary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text variant="body">{cat?.name ?? 'Sin categoría'}</Text>
          )}
        </View>

        {/* Nota */}
        <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Nota</Text>
          {editMode ? (
            <TextInput value={note} onChangeText={setNote} placeholder="Sin nota" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text }} />
          ) : (
            <Text variant="body" color={tx.note ? 'primary' : 'tertiary'}>{tx.note || 'Sin nota'}</Text>
          )}
        </View>

        {editMode ? (
          <TouchableOpacity onPress={handleSave} disabled={!amount} activeOpacity={0.8} style={{ height: 52, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', opacity: !amount ? 0.4 : 1 }}>
            <Text variant="button" color="white">Guardar cambios</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditMode(true)} activeOpacity={0.8} style={{ height: 52, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="button" color="white">Editar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
