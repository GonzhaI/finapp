import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DefaultError } from '@tanstack/react-query';
import { categoriesRepo, type InsertCategoryData } from '@/db/repositories/categories';
import type { CategoryKind } from '@/types';

export function useCategories(kind?: CategoryKind) {
  return useQuery({
    queryKey: ['categories', kind],
    queryFn: () => (kind ? categoriesRepo.getByKind(kind) : categoriesRepo.getAll()),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, InsertCategoryData>({
    mutationFn: (data) => categoriesRepo.create(data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, { id: string; data: Partial<InsertCategoryData> }>({
    mutationFn: ({ id, data }) => categoriesRepo.update(id, data) as unknown as Promise<unknown>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation<unknown, DefaultError, string>({
    mutationFn: (id) => {
      categoriesRepo.archive(id);
      return undefined as unknown as Promise<unknown>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
