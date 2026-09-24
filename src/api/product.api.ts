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

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);

  return response.data.data;
};

export const createProduct = async (
  data: CreateProductPayload,
  images: File[] = [],
): Promise<Product> => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("slug", data.slug);
  formData.append("description", data.description);
  formData.append("price", String(data.price));

  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null) {
    formData.append("compareAtPrice", String(data.compareAtPrice));
  }

  formData.append("category", data.category);

  if (data.brand) {
    formData.append("brand", data.brand);
  }

  formData.append("sku", data.sku);
  formData.append("stock", String(data.stock));

  formData.append("featured", String(data.featured ?? false));
  formData.append("bestSeller", String(data.bestSeller ?? false));

  if (data.isActive !== undefined) {
    formData.append("isActive", String(data.isActive));
  }

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post<ApiResponse<Product>>(
    "/products",
    formData,
  );

  return response.data.data;
};

export const updateProduct = async (
  id: string,
  data: UpdateProductPayload,
  images: File[] = [],
): Promise<Product> => {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.slug !== undefined) {
    formData.append("slug", data.slug);
  }

  if (data.description !== undefined) {
    formData.append("description", data.description);
  }

  if (data.price !== undefined) {
    formData.append("price", String(data.price));
  }

  if (data.compareAtPrice !== undefined) {
    formData.append(
      "compareAtPrice",
      data.compareAtPrice === null ? "" : String(data.compareAtPrice),
    );
  }

  if (data.category !== undefined) {
    formData.append("category", data.category);
  }

  if (data.brand !== undefined) {
    formData.append("brand", data.brand);
  }

  if (data.sku !== undefined) {
    formData.append("sku", data.sku);
  }

  if (data.stock !== undefined) {
    formData.append("stock", String(data.stock));
  }

  if (data.featured !== undefined) {
    formData.append("featured", String(data.featured));
  }

  if (data.bestSeller !== undefined) {
    formData.append("bestSeller", String(data.bestSeller));
  }

  if (data.isActive !== undefined) {
    formData.append("isActive", String(data.isActive));
  }

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.patch<ApiResponse<Product>>(
    `/products/${id}`,
    formData,
  );

  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};