import { create } from 'zustand';

interface CartUiState {
  isPanelOpen: boolean;
  itemCount: number;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setItemCount: (count: number) => void;
}

export const useCartUiStore = create<CartUiState>((set) => ({
  isPanelOpen: false,
  itemCount: 0,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setItemCount: (itemCount) => set({ itemCount }),
}));
