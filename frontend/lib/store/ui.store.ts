import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface Modal {
  id: string;
  isOpen: boolean;
  content?: React.ReactNode;
}

interface UIState {
  toasts: Toast[];
  modals: Modal[];
  isLoading: boolean;
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
  openModal: (id: string, content?: React.ReactNode) => void;
  closeModal: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  modals: [],
  isLoading: false,

  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  openModal: (id, content) =>
    set((state) => ({
      modals: [...state.modals.filter((m) => m.id !== id), { id, isOpen: true, content }],
    })),

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.map((modal) =>
        modal.id === id ? { ...modal, isOpen: false } : modal
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
