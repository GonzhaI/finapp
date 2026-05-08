import { router } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, modalOrbs, modalOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useCategories } from '@/hooks/queries/useCategories';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCreateTransaction } from '@/hooks/queries/useTransactions';
import { useCreateRecurringRule } from '@/hooks/queries/useRecurringRules';
import { decimalToMinor } from '@/utils/currency';
import { useHaptics } from '@/hooks/useHaptics';
import type { Category, Account, TransactionKind } from '@/types';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

const cronMap: Record<Frequency, string> = {
  weekly: '0 0 * * 1',
  biweekly: '0 0 1,15 * *',
  monthly: '0 0 1 * *',
  yearly: '0 0 1 1 *',
};

const frequencyOptions: { key: Frequency; label: string }[] = [
  { key: 'weekly', label: 'Semanal' },
  { key: 'biweekly', label: 'Quincenal' },
  { key: 'monthly', label: 'Mensual' },
  { key: 'yearly', label: 'Anual' },
];

export default function NewTransactionScreen() {
  const { theme, spacing, isDark } = useTheme();
  const { data: categories } = useCategories();
  const { data: accts } = useAccounts();
  const createTx = useCreateTransaction();
  const createRule = useCreateRecurringRule();
  const haptics = useHaptics();

  const [kind, setKind] = useState<TransactionKind>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [note, setNote] = useState('');

  // Transferencia
  const [transferToAccount, setTransferToAccount] = useState<Account | null>(null);
  const [transferIsExpense, setTransferIsExpense] = useState(false);
  const isTransfer = kind === 'transfer';
  const otherAccounts = accts?.filter((a) => a.id !== (selectedAccount?.id ?? '')) ?? [];
  const showTransferDest = isTransfer;

  // Regla recurrente
  const [createRecurring, setCreateRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  const filteredCategories =
    categories?.filter((c) => c.kind === (isTransfer ? 'expense' : kind)) ?? [];
  const defaultAccount = accts?.[0] ?? null;

  const handleSave = () => {
    const account = selectedAccount ?? defaultAccount;
    const n = parseFloat(amount);
    if (!account || !amount || isNaN(n) || n <= 0) return;

    const now = Date.now();
    const amountMinor = decimalToMinor(n, account.currency);

    if (isTransfer && transferToAccount && !transferIsExpense) {
      const pairId = `pair-${now}-${Math.random().toString(36).slice(2, 9)}`;

      createTx.mutate({
        id: `txn-${now}-1-${Math.random().toString(36).slice(2, 9)}`,
        accountId: account.id,
        kind: 'expense',
        amount: amountMinor,
        currency: account.currency,
        occurredAt: now,
        categoryId: selectedCategory?.id ?? null,
        note: note || `Transferencia a ${transferToAccount.name}`,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        transferPairId: pairId,
        recurringId: null,
      });

      createTx.mutate({
        id: `txn-${now}-2-${Math.random().toString(36).slice(2, 9)}`,
        accountId: transferToAccount.id,
        kind: 'income',
        amount: amountMinor,
        currency: account.currency,
        occurredAt: now,
        categoryId: null,
        note: `Transferencia de ${account.name}`,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        transferPairId: pairId,
        recurringId: null,
      });
    } else {
      const effectiveKind = isTransfer ? 'expense' : kind;
      const txId = `txn-${now}-${Math.random().toString(36).slice(2, 9)}`;

      createTx.mutate({
        id: txId,
        accountId: account.id,
        kind: effectiveKind,
        amount: amountMinor,
        currency: account.currency,
        occurredAt: now,
        categoryId: selectedCategory?.id ?? null,
        note: note || null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        transferPairId: null,
        recurringId: null,
      });
    }

    if (createRecurring) {
      const ruleId = `rule-${now}-${Math.random().toString(36).slice(2, 9)}`;
      createRule.mutate({
        id: ruleId,
        template: {
          kind: isTransfer ? 'expense' : kind,
          amount: amountMinor,
          currency: account.currency,
          categoryId: selectedCategory?.id ?? null,
          accountId: account.id,
          note: note || null,
        },
        cron: cronMap[frequency],
        nextRunAt: now,
        active: true,
      });
    }

    haptics.success();
    router.back();
  };

  const tabs: { label: string; value: TransactionKind }[] = [
    { label: 'Gasto', value: 'expense' },
    { label: 'Ingreso', value: 'income' },
    { label: 'Transf.', value: 'transfer' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? modalOrbs : modalOrbsLight} />

      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.glassHighlight }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">Cancelar</Text>
          </TouchableOpacity>
          <Text variant="body" style={{ fontWeight: '600' }}>Nuevo movimiento</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Segmentos de tipo */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {tabs.map((tab) => {
            const active = kind === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => {
                  haptics.selection();
                  setKind(tab.value);
                  setSelectedCategory(null);
                  setTransferToAccount(null);
                  setTransferIsExpense(false);
                }}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05, alignItems: 'center' }}
              >
                <Text variant="button" color={active ? 'inverse' : 'secondary'}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Monto */}
        <View>
          <Text variant="label" color="mutedAlt" align="center" style={{ marginBottom: spacing.xs }}>Monto</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="rgba(255,255,255,0.2)" style={{ fontSize: 34, fontWeight: '700', color: theme.colors.text, textAlign: 'center', paddingVertical: 0 }} />
        </View>

        {/* Cuenta origen */}
        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            {isTransfer ? 'Cuenta origen' : 'Cuenta'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {accts?.map((a) => {
              const active = (selectedAccount ?? defaultAccount)?.id === a.id;
              return (
                <TouchableOpacity key={a.id} onPress={() => { setSelectedAccount(a); setTransferToAccount(null); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05, borderWidth: 1, borderColor: active ? theme.colors.accentBackground : 'transparent' }}>
                  <Text variant="label" color={active ? 'white' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{a.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Cuenta destino (solo transferencia) */}
        {showTransferDest && (
          <View>
            <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
              Cuenta destino
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {otherAccounts.map((a) => {
                const active = transferToAccount?.id === a.id && !transferIsExpense;
                return (
                  <TouchableOpacity key={a.id} onPress={() => { setTransferToAccount(a); setTransferIsExpense(false); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05, borderWidth: 1, borderColor: active ? theme.colors.accentBackground : 'transparent' }}>
                    <Text variant="label" color={active ? 'white' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{a.name}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => { setTransferToAccount(null); setTransferIsExpense(true); }} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: transferIsExpense ? theme.colors.expenseBackground : theme.colors.glassFill05, borderWidth: 1, borderColor: transferIsExpense ? theme.colors.expense : 'transparent' }}>
                <Text variant="label" color={transferIsExpense ? 'expense' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>Otro (gasto)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categoría */}
        {!isTransfer && (
          <View>
            <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>Categoría</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {filteredCategories.map((c) => {
                const active = selectedCategory?.id === c.id;
                return (
                  <TouchableOpacity key={c.id} onPress={() => setSelectedCategory(c)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? c.color : theme.colors.glassFill05, borderWidth: 1, borderColor: active ? `${c.color}40` : 'transparent' }}>
                    <Text variant="label" color={active ? 'white' : 'tertiary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Nota */}
        <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Nota (opcional)</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Ej: almuerzo con amigos" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text, paddingVertical: 0 }} />
        </View>

        {/* Regla recurrente (#3) */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: createRecurring ? spacing.sm : 0 }}>
            <View>
              <Text variant="itemName" color="secondary">Crear regla recurrente</Text>
              <Text variant="micro" color="tertiary">Se repetirá automáticamente según la frecuencia</Text>
            </View>
            <Switch
              value={createRecurring}
              onValueChange={(v) => { haptics.selection(); setCreateRecurring(v); }}
              trackColor={{ false: theme.colors.separator, true: theme.colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          {createRecurring && (
            <View style={{ flexDirection: 'row', gap: spacing.xs }}>
              {frequencyOptions.map((opt) => {
                const active = frequency === opt.key;
                return (
                  <TouchableOpacity key={opt.key} onPress={() => setFrequency(opt.key)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05, alignItems: 'center' }}>
                    <Text variant="subhead" color={active ? 'inverse' : 'secondary'}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={(() => { const n = parseFloat(amount); return !amount || isNaN(n) || n <= 0 || (!selectedAccount && !defaultAccount); })() || createTx.isPending}
          activeOpacity={0.8}
          style={{ height: 52, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', opacity: !amount || (!selectedAccount && !defaultAccount) ? 0.4 : 1 }}
        >
          <Text variant="button" color="white">{createTx.isPending ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
