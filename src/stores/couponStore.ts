import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppliedCoupon {
  code: string;
  discount: number;
  free_shipping: boolean;
}

interface CouponStore {
  applied: AppliedCoupon | null;
  apply: (c: AppliedCoupon) => void;
  clear: () => void;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set) => ({
      applied: null,
      apply: (c) => set({ applied: c }),
      clear: () => set({ applied: null }),
    }),
    { name: 'mystore-coupon' }
  )
);
