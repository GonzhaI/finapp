import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DefaultError } from '@tanstack/react-query';
import {
  currenciesRepo,
  exchangeRatesRepo,
  type InsertExchangeRateData,
} from '@/db/repositories/exchangeRates';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => currenciesRepo.getAll(),
    staleTime: Infinity,
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchangeRates'],
    queryFn: () => exchangeRatesRepo.getAll(),
    staleTime: 10_000,
  });
}

export function useExchangeRate(from: string, to: string) {
  return useQuery({
    queryKey: ['exchangeRates', from, to],
    queryFn: () => exchangeRatesRepo.getRate(from, to),
    enabled: !!from && !!to,
  });
}

export function useCreateExchangeRate() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, InsertExchangeRateData>({
    mutationFn: (data) => exchangeRatesRepo.create(data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchangeRates'] }),
  });
}

export function useDeleteExchangeRate() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (id) => {
      exchangeRatesRepo.delete(id);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchangeRates'] }),
  });
}
