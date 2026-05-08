import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DefaultError } from '@tanstack/react-query';
import { recurringRulesRepo, type InsertRecurringRuleData } from '@/db/repositories/recurringRules';

export function useRecurringRules() {
  return useQuery({
    queryKey: ['recurringRules'],
    queryFn: () => recurringRulesRepo.getAll(),
    staleTime: 10_000,
  });
}

export function useRecurringRule(id: string) {
  return useQuery({
    queryKey: ['recurringRules', id],
    queryFn: () => recurringRulesRepo.getById(id),
    enabled: !!id,
  });
}

export function useCreateRecurringRule() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, InsertRecurringRuleData>({
    mutationFn: (data) => recurringRulesRepo.create(data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurringRules'] }),
  });
}

export function useUpdateRecurringRule() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    DefaultError,
    { id: string; data: Partial<InsertRecurringRuleData> }
  >({
    mutationFn: ({ id, data }) =>
      recurringRulesRepo.update(id, data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurringRules'] }),
  });
}

export function useToggleRecurringRule() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, { id: string; active: boolean }>({
    mutationFn: ({ id, active }) => {
      recurringRulesRepo.toggle(id, active);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurringRules'] }),
  });
}

export function useDeleteRecurringRule() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (id) => {
      recurringRulesRepo.delete(id);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurringRules'] }),
  });
}
