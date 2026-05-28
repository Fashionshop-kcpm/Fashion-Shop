import api from "./axios";

export const getProducts = (params) => api.get("/products", { params });
export const createProduct = (data) => api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProduct = (id, data) => api.post(`/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);
