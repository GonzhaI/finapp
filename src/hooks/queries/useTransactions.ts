import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DefaultError } from '@tanstack/react-query';
import { transactionsRepo, type InsertTransactionData } from '@/db/repositories/transactions';

export function useTransactions(limit = 50) {
  return useQuery({
    queryKey: ['transactions', { limit }],
    queryFn: () => transactionsRepo.getAll(limit),
    staleTime: 10_000,
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsRepo.getById(id!),
    enabled: id !== null,
  });
}

export function useTransactionsByAccount(accountId: string | null) {
  return useQuery({
    queryKey: ['transactions', 'account', accountId],
    queryFn: () => transactionsRepo.getByAccount(accountId!),
    enabled: accountId !== null,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, InsertTransactionData>({
    mutationFn: (data) => transactionsRepo.create(data) as unknown as Promise<unknown>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    DefaultError,
    { id: string; data: Partial<InsertTransactionData> }
  >({
    mutationFn: ({ id, data }) => transactionsRepo.update(id, data) as unknown as Promise<unknown>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (id) => {
      transactionsRepo.softDelete(id);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
