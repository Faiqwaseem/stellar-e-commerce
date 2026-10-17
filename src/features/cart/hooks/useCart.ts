
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addCartItem,
  clearServerCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '@/api/cart.api';
import { CartItemPayload } from '@/types';

export const cartKeys = {
  all: ['cart'] as const,
  current: () => [...cartKeys.all, 'current'] as const,
};

export const useCart = (enabled = true) =>
  useQuery({
    queryKey: cartKeys.current(),
    queryFn: getCart,
    enabled,
  });

export const useAddCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CartItemPayload) => addCartItem(payload),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CartItemPayload) => updateCartItem(payload),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartKeys.current(), cart);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearServerCart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cartKeys.current(),
      });
    },
  });
};
