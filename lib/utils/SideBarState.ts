import { create } from 'zustand';

interface SideBarState {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const useSideBarState = create<SideBarState>((set) => ({
  isOpen: false,
  setIsOpen: (value: boolean) => set({ isOpen: value }),
}));
