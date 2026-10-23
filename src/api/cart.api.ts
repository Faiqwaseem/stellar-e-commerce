
import api from './axios';

import type { CartItemPayload, Product, ServerCart } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/*
|--------------------------------------------------------------------------
| GET /cart
|------------------------------------------------------------------------
*/
export const getCart = async (): Promise<ServerCart> => {
  const response = await api.get<ApiResponse<ServerCart>>('/cart');
  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| POST /cart/items
|------------------------------------------------------------------------
*/
export const addCartItem = async (
  payload: CartItemPayload,
): Promise<ServerCart> => {
  const response = await api.post<ApiResponse<ServerCart>>(
    '/cart/items',
    payload,
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| PATCH /cart/items
|------------------------------------------------------------------------
*/
export const updateCartItem = async (
  payload: CartItemPayload,
): Promise<ServerCart> => {
  const response = await api.patch<ApiResponse<ServerCart>>(
    '/cart/items',
    payload,
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| DELETE /cart/items
|------------------------------------------------------------------------
*/
export const removeCartItem = async (
  product: string,
): Promise<ServerCart> => {
  const response = await api.delete<ApiResponse<ServerCart>>(
    '/cart/items',
    { data: { product } },
  );

  return response.data.data;
};

/*
|--------------------------------------------------------------------------
| DELETE /cart
|------------------------------------------------------------------------
*/
export const clearServerCart = async (): Promise<void> => {
  await api.delete('/cart');
};
