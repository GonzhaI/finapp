import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DefaultError } from '@tanstack/react-query';
import { accountsRepo, type InsertAccountData } from '@/db/repositories/accounts';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsRepo.getAll(),
    staleTime: 30_000,
  });
}

export function useAccount(id: string | null) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsRepo.getById(id!),
    enabled: id !== null,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, InsertAccountData>({
    mutationFn: (data) => accountsRepo.create(data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, { id: string; data: Partial<InsertAccountData> }>({
    mutationFn: ({ id, data }) => accountsRepo.update(id, data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (id) => {
      accountsRepo.archive(id);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  });
}
