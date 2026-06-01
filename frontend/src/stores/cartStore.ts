import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  discount: number;
  tax: number;
  addItem: (product: { id: string; name: string; price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number) => void;
  setTax: (rate: number) => void;
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  tax: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.productId === product.id
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price,
                }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
          },
        ],
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [], discount: 0, tax: 0 });
  },

  setDiscount: (amount) => set({ discount: amount }),

  setTax: (rate) => set({ tax: rate }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const afterDiscount = subtotal - get().discount;
    return afterDiscount * (get().tax / 100);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const afterDiscount = subtotal - get().discount;
    const taxAmount = afterDiscount * (get().tax / 100);
    return afterDiscount + taxAmount;
  },
}));
