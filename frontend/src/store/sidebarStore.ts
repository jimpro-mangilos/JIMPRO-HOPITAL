import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
  initialize: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 1024 : false,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),

  initialize: () => {
    const isMobile = window.innerWidth < 1024;
    set({ isMobile, isOpen: !isMobile });
  },
}));
