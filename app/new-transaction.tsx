import { router } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pill } from '@/components/ui/Pill';
import { useCategories } from '@/hooks/queries/useCategories';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCreateTransaction } from '@/hooks/queries/useTransactions';
import { decimalToMinor } from '@/utils/currency';
import type { Category, Account, TransactionKind } from '@/types';

export default function NewTransactionScreen() {
  const { theme, spacing } = useTheme();
  const { data: categories } = useCategories();
  const { data: accts } = useAccounts();
  const createTx = useCreateTransaction();

  const [kind, setKind] = useState<TransactionKind>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [note, setNote] = useState('');

  const filteredCategories = categories?.filter((c) => c.kind === kind) ?? [];
  const defaultAccount = accts?.[0] ?? null;

  const handleSave = () => {
    const account = selectedAccount ?? defaultAccount;
    if (!account || !amount) return;

    const id = `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    createTx.mutate({
      id,
      accountId: account.id,
      categoryId: selectedCategory?.id ?? null,
      kind,
      amount: decimalToMinor(Number(amount), account.currency),
      currency: account.currency,
      occurredAt: Date.now(),
      note: note || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    router.back();
  };

  const tabs: { label: string; value: TransactionKind }[] = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ingreso', value: 'income' },
    { label: 'Transf.', value: 'transfer' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" color="accent">
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text variant="title3">Nuevo movimiento</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Tipo: Gasto / Ingreso / Transferencia */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => {
                setKind(tab.value);
                setSelectedCategory(null);
              }}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: 999,
                backgroundColor:
                  kind === tab.value ? theme.colors.accent : theme.colors.surface,
                alignItems: 'center',
              }}
            >
              <Text variant="button" color={kind === tab.value ? 'inverse' : 'secondary'}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Monto */}
        <Input
          label="Monto"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
          style={{ fontSize: 34, fontWeight: '700', textAlign: 'center' }}
        />

        {/* Cuenta */}
        <View>
          <Text variant="subhead" color="secondary" style={{ marginBottom: spacing.xs }}>
            Cuenta
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {accts?.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => setSelectedAccount(a)}
              >
                <Pill
                  label={a.name}
                  color={
                    (selectedAccount ?? defaultAccount)?.id === a.id
                      ? theme.colors.accent
                      : theme.colors.textSecondary
                  }
                  size="sm"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categoría */}
        <View>
          <Text variant="subhead" color="secondary" style={{ marginBottom: spacing.xs }}>
            Categoría
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {filteredCategories.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCategory(c)}
              >
                <Pill
                  label={c.name}
                  color={
                    selectedCategory?.id === c.id ? c.color : theme.colors.textTertiary
                  }
                  size="sm"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nota */}
        <Input
          label="Nota (opcional)"
          value={note}
          onChangeText={setNote}
          placeholder="Ej: almuerzo con amigos"
        />

        {/* Submit */}
        <Button
          kind="primary"
          disabled={!amount || (!selectedAccount && !defaultAccount)}
          loading={createTx.isPending}
          onPress={handleSave}
        >
          Guardar
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
