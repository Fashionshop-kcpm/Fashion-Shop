import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("admin_token") || null,
  admin: JSON.parse(localStorage.getItem("admin_user") || "null"),

  setAuth: (admin, token) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(admin));
    set({ token, admin });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    set({ token: null, admin: null });
  },
}));

export default useAuthStore;
