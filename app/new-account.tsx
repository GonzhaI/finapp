import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/ui/Text';
import { BackgroundOrbs, modalOrbs, modalOrbsLight } from '@/components/ui/BackgroundOrbs';
import { useAccounts, useAccount, useCreateAccount, useUpdateAccount, useArchiveAccount } from '@/hooks/queries/useAccounts';
import { useHaptics } from '@/hooks/useHaptics';
import { minorToDecimal, decimalToMinor } from '@/utils/currency';
import type { AccountKind } from '@/types';

const accountKinds: { kind: AccountKind; es: string }[] = [
  { kind: 'cash', es: 'Efectivo' },
  { kind: 'debit', es: 'Débito' },
  { kind: 'checking', es: 'Cuenta corriente' },
  { kind: 'digital_wallet', es: 'Billetera digital' },
  { kind: 'credit', es: 'Crédito' },
  { kind: 'savings', es: 'Ahorro' },
  { kind: 'investment', es: 'Inversión' },
  { kind: 'other', es: 'Otro' },
];

const currencies = [
  { code: 'CLP', label: 'CLP - Peso chileno' },
  { code: 'USD', label: 'USD - Dólar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'ARS', label: 'ARS - Peso argentino' },
  { code: 'BRL', label: 'BRL - Real' },
  { code: 'MXN', label: 'MXN - Peso mexicano' },
  { code: 'PEN', label: 'PEN - Sol' },
  { code: 'UYU', label: 'UYU - Peso uruguayo' },
  { code: 'GBP', label: 'GBP - Libra' },
];

const iconColors = ['#7864f0', '#32d578', '#ff6060', '#ffb432', '#32b4ff', '#ff375f', '#bf5af2', '#5856d6', '#0a84ff'];

export default function NewAccountScreen() {
  const { theme, spacing, isDark } = useTheme();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const { data: existing } = useAccount(id ?? null);
  const { data: allAccounts } = useAccounts();
  const createAcc = useCreateAccount();
  const updateAcc = useUpdateAccount();
  const archiveAcc = useArchiveAccount();

  const [name, setName] = useState('');
  const [kind, setKind] = useState<AccountKind>('checking');
  const [currency, setCurrency] = useState('CLP');
  const [provider, setProvider] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [color, setColor] = useState(iconColors[0]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setKind(existing.kind);
      setCurrency(existing.currency);
      setProvider(existing.provider ?? '');
      setInitialBalance(String(minorToDecimal(existing.initialBalance, existing.currency)));
      setCreditLimit(existing.creditLimit != null ? String(minorToDecimal(existing.creditLimit, existing.currency)) : '');
      setColor(existing.color);
    }
  }, [existing]);

  const handleSave = () => {
    if (!name.trim()) return;

    const initBal = initialBalance ? parseFloat(initialBalance) : 0;
    if (isNaN(initBal) || initBal < 0) return;

    let creditLim: number | null = null;
    if (kind === 'credit' && creditLimit) {
      const cl = parseFloat(creditLimit);
      if (!isNaN(cl) && cl >= 0) {
        creditLim = decimalToMinor(cl, currency);
      }
    }

    haptics.success();

    const data = {
      name: name.trim(),
      kind,
      currency,
      provider: provider.trim() || null,
      initialBalance: decimalToMinor(initBal, currency),
      creditLimit: creditLim,
      color,
      icon: kind,
      archived: false,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    const trimmed = name.trim();
    const duplicate = allAccounts?.find(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase() && a.id !== id,
    );
    if (duplicate) {
      Alert.alert('Nombre duplicado', 'Ya existe una cuenta con ese nombre.');
      return;
    }

    if (isEdit && id) {
      updateAcc.mutate({ id, data });
    } else {
      const newId = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      createAcc.mutate({ id: newId, ...data });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    haptics.warning();
    archiveAcc.mutate(id);
    router.back();
  };

  const showCreditLimit = kind === 'credit';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <BackgroundOrbs orbs={isDark ? modalOrbs : modalOrbsLight} />

      <View style={{ alignItems: 'center', paddingTop: 8 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.glassHighlight }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 15 }} color="accent">Cancelar</Text>
          </TouchableOpacity>
          <Text variant="body" style={{ fontWeight: '600' }}>{isEdit ? 'Editar cuenta' : 'Nueva cuenta'}</Text>
          {isEdit ? (
            <TouchableOpacity onPress={handleDelete}>
              <Text variant="body" style={{ fontSize: 15 }} color="expense">Eliminar</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Nombre */}
        <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Ej: Cuenta corriente" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text }} />
        </View>

        {/* Tipo */}
        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>Tipo de cuenta</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {accountKinds.map(({ kind: k, es }) => {
              const active = kind === k;
              return (
                <TouchableOpacity key={k} onPress={() => setKind(k)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05 }}>
                  <Text variant="label" color={active ? 'white' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{es}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Moneda */}
        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>Moneda</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {currencies.map(({ code }) => {
              const active = currency === code;
              return (
                <TouchableOpacity key={code} onPress={() => setCurrency(code)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: active ? theme.colors.accent : theme.colors.glassFill05 }}>
                  <Text variant="label" color={active ? 'white' : 'secondary'} style={{ textTransform: 'none', letterSpacing: 0 }}>{code}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Color */}
        <View>
          <Text variant="itemName" color="secondary" style={{ marginBottom: spacing.xs }}>Color</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {iconColors.map((c) => (
              <TouchableOpacity key={c} onPress={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: theme.colors.text }} />
            ))}
          </View>
        </View>

        {/* Proveedor */}
        <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Proveedor (opcional)</Text>
          <TextInput value={provider} onChangeText={setProvider} placeholder="Ej: Banco Estado" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text }} />
        </View>

        {/* Saldo inicial */}
        <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Saldo inicial</Text>
          <TextInput value={initialBalance} onChangeText={setInitialBalance} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text }} />
        </View>

        {/* Límite de crédito */}
        {showCreditLimit && (
          <View style={{ backgroundColor: theme.colors.surfaceGlass, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.glassBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text variant="micro" color="tertiary" style={{ marginBottom: 2 }}>Límite de crédito</Text>
            <TextInput value={creditLimit} onChangeText={setCreditLimit} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={theme.colors.textTertiary} style={{ fontSize: 17, color: theme.colors.text }} />
          </View>
        )}

        <TouchableOpacity onPress={handleSave} disabled={!name.trim()} activeOpacity={0.8} style={{ height: 52, borderRadius: 14, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center', opacity: !name.trim() ? 0.4 : 1 }}>
          <Text variant="button" color="white">{isEdit ? 'Guardar cambios' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
