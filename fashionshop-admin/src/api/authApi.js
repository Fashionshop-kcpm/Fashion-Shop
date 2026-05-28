import axios from "axios";

const base = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export const adminLogin = (data) => base.post("/admin/login", data);

export const adminLogout = () => {
  const token = localStorage.getItem("admin_token");
  return base.post("/admin/logout", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
