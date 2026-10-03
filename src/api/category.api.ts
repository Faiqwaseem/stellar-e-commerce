import api from "./axios";

import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<ApiResponse<Category[]>>("/categories");

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| GET CATEGORY BY ID
|--------------------------------------------------------------------------
*/

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get<ApiResponse<Category>>(
    `/categories/${id}`,
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| CREATE CATEGORY
|--------------------------------------------------------------------------
*/

export const createCategory = async (
  data: CreateCategoryPayload,
  imageFile?: File,
): Promise<Category> => {
  const formData = new FormData();


  formData.append("name", data.name);
  formData.append("slug", data.slug);

  if (data.description) {
    formData.append("description", data.description);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await api.post<ApiResponse<Category>>(
    "/categories",
    formData,
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/

export const updateCategory = async (
  id: string,
  data: UpdateCategoryPayload,
  imageFile?: File,
): Promise<Category> => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("slug", data.slug);

  if (data.description) {
    formData.append("description", data.description);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await api.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    formData,
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| DELETE CATEGORY
|--------------------------------------------------------------------------
*/

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};