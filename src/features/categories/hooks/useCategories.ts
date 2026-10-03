import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/category.api";

import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";

export const categoryKeys = {
  all: ["categories"] as const,

  lists: () => [...categoryKeys.all, "list"] as const,

  detail: (id: string) =>
    [...categoryKeys.all, "detail", id] as const,
};

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: getAllCategories,
  });
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY BY ID
|--------------------------------------------------------------------------
*/

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
};

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      image,
    }: {
      data: CreateCategoryPayload;
      image?: File;
    }) => createCategory(data, image),

    onSuccess: (createdCategory) => {
      queryClient.setQueryData<Category[]>(
        categoryKeys.lists(),
        (currentCategories = []) => [
          createdCategory,
          ...currentCategories,
        ],
      );
    },
  });
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      image,
    }: {
      id: string;
      data: UpdateCategoryPayload;
      image?: File;
    }) => updateCategory(id, data, image),

    onSuccess: (updatedCategory, variables) => {
      queryClient.setQueryData<Category[]>(
        categoryKeys.lists(),
        (currentCategories = []) =>
          currentCategories.map((category) =>
            category._id === variables.id
              ? updatedCategory
              : category,
          ),
      );

      queryClient.setQueryData(
        categoryKeys.detail(variables.id),
        updatedCategory,
      );
    },
  });
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),

    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Category[]>(
        categoryKeys.lists(),
        (currentCategories = []) =>
          currentCategories.filter(
            (category) => category._id !== deletedId,
          ),
      );

      queryClient.removeQueries({
        queryKey: categoryKeys.detail(deletedId),
      });
    },
  });
};