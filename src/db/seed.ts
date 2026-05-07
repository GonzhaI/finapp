import { db } from './client';
import { accounts, categories, currencies } from './schema';

/**
 * Inserta datos iniciales de ejemplo si la DB está vacía.
 * Solo para desarrollo. No ejecutar en producción.
 */
export async function seed() {
  const existingCurrencies = await db.select().from(currencies).limit(1);
  if (existingCurrencies.length > 0) return;

  const now = Date.now();

  // Monedas
  await db.insert(currencies).values([
    { code: 'CLP', symbol: '$', decimalPlaces: 0, nameEs: 'Peso chileno', nameEn: 'Chilean Peso' },
    { code: 'USD', symbol: 'US$', decimalPlaces: 2, nameEs: 'Dólar estadounidense', nameEn: 'US Dollar' },
    { code: 'EUR', symbol: '€', decimalPlaces: 2, nameEs: 'Euro', nameEn: 'Euro' },
    { code: 'ARS', symbol: 'AR$', decimalPlaces: 2, nameEs: 'Peso argentino', nameEn: 'Argentine Peso' },
    { code: 'BRL', symbol: 'R$', decimalPlaces: 2, nameEs: 'Real brasileño', nameEn: 'Brazilian Real' },
    { code: 'MXN', symbol: 'MX$', decimalPlaces: 2, nameEs: 'Peso mexicano', nameEn: 'Mexican Peso' },
    { code: 'GBP', symbol: '£', decimalPlaces: 2, nameEs: 'Libra esterlina', nameEn: 'British Pound' },
    { code: 'PEN', symbol: 'S/', decimalPlaces: 2, nameEs: 'Sol peruano', nameEn: 'Peruvian Sol' },
    { code: 'UYU', symbol: '$U', decimalPlaces: 2, nameEs: 'Peso uruguayo', nameEn: 'Uruguayan Peso' },
  ]);

  // Categorías por defecto
  const catId = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-') + '-seed';

  await db.insert(categories).values([
    // Income
    { id: catId('Sueldo'), name: 'Sueldo', kind: 'income', color: '#30D158', icon: 'dollarsign.circle', sortOrder: 0, createdAt: now },
    { id: catId('Freelance'), name: 'Freelance', kind: 'income', color: '#30D158', icon: 'laptopcomputer', sortOrder: 1, createdAt: now },
    { id: catId('Regalo'), name: 'Regalo', kind: 'income', color: '#FF9F0A', icon: 'gift', sortOrder: 2, createdAt: now },
    // Expense
    { id: catId('Comida'), name: 'Comida', kind: 'expense', color: '#FF453A', icon: 'fork.knife', sortOrder: 0, createdAt: now },
    { id: catId('Transporte'), name: 'Transporte', kind: 'expense', color: '#FF9F0A', icon: 'car', sortOrder: 1, createdAt: now },
    { id: catId('Vivienda'), name: 'Vivienda', kind: 'expense', color: '#5AC8FA', icon: 'house', sortOrder: 2, createdAt: now },
    { id: catId('Entretención'), name: 'Entretención', kind: 'expense', color: '#BF5AF2', icon: 'tv', sortOrder: 3, createdAt: now },
    { id: catId('Salud'), name: 'Salud', kind: 'expense', color: '#30D158', icon: 'heart', sortOrder: 4, createdAt: now },
    { id: catId('Suscripciones'), name: 'Suscripciones', kind: 'expense', color: '#FF453A', icon: 'repeat', sortOrder: 5, createdAt: now },
    { id: catId('Otros'), name: 'Otros', kind: 'expense', color: '#8E8E93', icon: 'ellipsis', sortOrder: 99, createdAt: now },
  ]);

  // Cuenta de ejemplo
  const existingAccounts = await db.select().from(accounts).limit(1);
  if (existingAccounts.length > 0) return;

  await db.insert(accounts).values([
    {
      id: 'cash-default',
      name: 'Efectivo',
      kind: 'cash',
      provider: null,
      currency: 'CLP',
      initialBalance: 50000,
      creditLimit: null,
      color: '#30D158',
      icon: 'banknote',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'debit-default',
      name: 'Cuenta débito',
      kind: 'debit',
      provider: 'BancoEstado',
      currency: 'CLP',
      initialBalance: 500000,
      creditLimit: null,
      color: '#0A84FF',
      icon: 'building.columns',
      archived: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}
