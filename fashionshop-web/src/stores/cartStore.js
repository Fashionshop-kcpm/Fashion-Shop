import { create } from "zustand";

const useCartStore = create((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
}));

export default useCartStore;
