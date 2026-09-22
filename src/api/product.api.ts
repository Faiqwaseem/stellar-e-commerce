import api from "./axios";

import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getAllProducts = async (): Promise<Product[]> => {
  const response = await api.get<ApiResponse<Product[]>>("/products");

  return response.data.data;
};

export const getProductById = async (
  id: string
): Promise<Product> => {
  const response = await api.get<ApiResponse<Product>>(
    `/products/${id}`
  );

  return response.data.data;
};

export const createProduct = async (
  data: CreateProductPayload
): Promise<Product> => {
  const response = await api.post<ApiResponse<Product>>(
    "/products",
    data
  );

  return response.data.data;
};

export const updateProduct = async (
  id: string,
  data: UpdateProductPayload
): Promise<Product> => {
  const response = await api.patch<ApiResponse<Product>>(
    `/products/${id}`,
    data
  );

  return response.data.data;
};

export const deleteProduct = async (
  id: string
): Promise<void> => {
  await api.delete(`/products/${id}`);
};