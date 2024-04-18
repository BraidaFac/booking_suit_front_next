import { create } from 'zustand';

interface UserState {
  user: {
    name: string;
    role: string;
  } | null;
  setUser: (user: { name: string; role: string } | null) => void;
}

export const useUserState = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
