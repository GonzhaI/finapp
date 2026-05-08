import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useT } from '@/i18n/useT';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, modalOrbs, modalOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useCategories } from '@/hooks/queries/useCategories';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCreateRecurringRule, useUpdateRecurringRule, useRecurringRule } from '@/hooks/queries/useRecurringRules';
import { decimalToMinor } from '@/utils/currency';
import type { Category, Account } from '@/types';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

const cronMap: Record<Frequency, string> = {
  weekly: '0 0 * * 1',
  biweekly: '0 0 1,15 * *',
  monthly: '0 0 1 * *',
  yearly: '0 0 1 1 *',
};

const frequencyOptions: { key: Frequency; es: string; en: string }[] = [
  { key: 'weekly', es: 'Semanal', en: 'Weekly' },
  { key: 'biweekly', es: 'Quincenal', en: 'Biweekly' },
  { key: 'monthly', es: 'Mensual', en: 'Monthly' },
  { key: 'yearly', es: 'Anual', en: 'Yearly' },
];

function cronToFrequency(cron: string): Frequency {
  const entry = Object.entries(cronMap).find(([, v]) => v === cron);
  return (entry?.[0] as Frequency) ?? 'monthly';
}

export default function NewRecurringScreen() {
  const { theme, spacing, isDark } = useTheme();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: categories } = useCategories();
  const { data: accts } = useAccounts();
  const { data: existingRule } = useRecurringRule(id ?? '');
  const createRule = useCreateRecurringRule();
  const updateRule = useUpdateRecurringRule();

  const [kind, setKind] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');

  useEffect(() => {
    if (existingRule) {
      const tmpl = (existingRule.template ?? {}) as Record<string, unknown>;
      setKind((tmpl.kind as 'income' | 'expense') ?? 'expense');
      if (tmpl.amount) {
        const amt = Number(tmpl.amount);
        setAmount(amt > 0 ? String(amt) : '');
      }
      if (tmpl.note) setNote(String(tmpl.note));
      setFrequency(cronToFrequency(existingRule.cron));

      if (tmpl.categoryId && categories) {
        const cat = categories.find((c) => c.id === tmpl.categoryId);
        if (cat) setSelectedCategory(cat);
      }
      if (tmpl.accountId && accts) {
        const acct = accts.find((a) => a.id === tmpl.accountId);
        if (acct) setSelectedAccount(acct);
      }
    }
  }, [existingRule, categories, accts]);

  const filteredCategories = categories?.filter((c) => c.kind === kind) ?? [];
  const defaultAccount = accts?.[0] ?? null;

  const handleSave = () => {
    const account = selectedAccount ?? defaultAccount;
    if (!account || !amount) return;
    const n = Number(amount);
    if (isNaN(n) || n <= 0) return;

    const template = {
      kind,
      amount: decimalToMinor(Number(amount), account.currency),
      currency: account.currency,
      categoryId: selectedCategory?.id ?? null,
      accountId: account.id,
      note: note || null,
    };

    if (isEdit && id) {
      updateRule.mutate({
        id,
        data: {
          template,
          cron: cronMap[frequency],
          nextRunAt: existingRule?.nextRunAt ?? Date.now(),
        },
      });
    } else {
      const newId = `rule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      createRule.mutate({
        id: newId,
        template,
        cron: cronMap[frequency],
        nextRunAt: Date.now(),
        active: true,
      });
    }

    router.back();
  };

  const kindTabs = [
    { label: 'Gasto', value: 'expense' as const },
    { label: 'Ingreso', value: 'income' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? modalOrbs : modalOrbsLight} />

      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.glassHighlight,
          }}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {isEdit ? t('recurring.editRule') : t('recurring.newRule')}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {kindTabs.map((tab) => {
            const active = kind === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => {
                  setKind(tab.value);
                  setSelectedCategory(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                  alignItems: 'center',
                }}
              >
                <Text variant="button" color={active ? 'inverse' : 'secondary'}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View>
          <Text variant="label" color="mutedAlt" align="center" style={{ marginBottom: spacing.xs }}>
            Monto
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="rgba(255,255,255,0.2)"
            style={{
              fontSize: 34,
              fontWeight: '700',
              color: theme.colors.text,
              textAlign: 'center',
              paddingVertical: 0,
            }}
          />
        </View>

        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            Cuenta
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {accts?.map((a) => {
              const active = (selectedAccount ?? defaultAccount)?.id === a.id;
              return (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => setSelectedAccount(a)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.accentBackground : 'transparent',
                  }}
                >
                  <Text
                    variant="label"
                    color={active ? 'white' : 'secondary'}
                    style={{ textTransform: 'none', letterSpacing: 0 }}
                  >
                    {a.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            Categoría
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {filteredCategories.map((c) => {
              const active = selectedCategory?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCategory(c)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    backgroundColor: active ? c.color : theme.colors.glassFill05,
                    borderWidth: 1,
                    borderColor: active ? `${c.color}40` : 'transparent',
                  }}
                >
                  <Text
                    variant="label"
                    color={active ? 'white' : 'tertiary'}
                    style={{ textTransform: 'none', letterSpacing: 0 }}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.surfaceGlass,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.glassBorder,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>
            Nota (opcional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ej: suscripción Netflix"
            placeholderTextColor={theme.colors.textTertiary}
            style={{ fontSize: 17, color: theme.colors.text, paddingVertical: 0 }}
          />
        </View>

        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>
            {t('recurring.frequency')}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {frequencyOptions.map((opt) => {
              const active = frequency === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setFrequency(opt.key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05,
                    alignItems: 'center',
                  }}
                >
                  <Text variant="subhead" color={active ? 'inverse' : 'secondary'}>
                    {opt.es}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!amount || (!selectedAccount && !defaultAccount) || createRule.isPending || updateRule.isPending}
          activeOpacity={0.8}
          style={{
            height: 52,
            borderRadius: 14,
            backgroundColor: theme.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: !amount || (!selectedAccount && !defaultAccount) ? 0.4 : 1,
          }}
        >
          <Text variant="button" color="white">
            {createRule.isPending || updateRule.isPending ? 'Guardando...' : t('common.save')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
