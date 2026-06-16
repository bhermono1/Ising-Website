import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  notes?: string;
};

type CartState = {
  items: CartItem[];
  reservationId: string | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  setReservationId: (id: string | null) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      reservationId: null,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        })),
      setReservationId: (id) => set({ reservationId: id }),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "crescendo-cart" }
  )
);
