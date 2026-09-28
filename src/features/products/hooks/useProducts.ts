import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "@/api/product.api";

import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@/types";

export const productKeys = {
  all: ["products"] as const,

  lists: () => [...productKeys.all, "list"] as const,

  details: () => [...productKeys.all, "detail"] as const,

  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: getAllProducts,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const products = await getAllProducts();

      console.log("GET /products RESPONSE:", products);

      return products;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      images,
    }: {
      data: CreateProductPayload;
      images?: File[];
    }) => createProduct(data, images),

    onSuccess: (createdProduct) => {
      
      queryClient.setQueryData<Product[]>(
        productKeys.lists(),
        (currentProducts = []) => [
          createdProduct,
          ...currentProducts,
        ],
        
      );

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
        refetchType: "none",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      images,
    }: {
      id: string;
      data: UpdateProductPayload;
      images?: File[];
    }) => updateProduct(id, data, images),

    onSuccess: (updatedProduct, variables) => {
      queryClient.setQueryData<Product[]>(
        productKeys.lists(),
        (currentProducts = []) =>
          currentProducts.map((product) =>
            product._id === variables.id
              ? updatedProduct
              : product,
          ),
      );

      queryClient.setQueryData(
        productKeys.detail(variables.id),
        updatedProduct,
      );

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
        refetchType: "none",
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
        refetchType: "none",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),

    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Product[]>(
        productKeys.lists(),
        (currentProducts = []) =>
          currentProducts.filter(
            (product) => product._id !== deletedId,
          ),
      );

      queryClient.removeQueries({
        queryKey: productKeys.detail(deletedId),
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
        refetchType: "none",
      });
    },
  });
};