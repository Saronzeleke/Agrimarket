import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (user) => {
    // Tokens are now stored in httpOnly cookies by backend, no localStorage needed
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    // Cookies will be cleared by backend logout endpoint
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    set({ user });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
