import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentlyViewedStore {
  items: Product[];
  add: (product: Product) => void;
  clear: () => void;
}

const MAX = 12;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => {
          const filtered = state.items.filter((p) => p.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'mystore-recently-viewed' }
  )
);
