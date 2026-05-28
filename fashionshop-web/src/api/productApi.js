import api from "./axios";

// params: { keyword, category_id, gioi_tinh, tab, page, per_page }
export const getProducts = (params) => api.get("/products", { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getCategories = () => api.get("/categories");
export const getProductReviews = (id) => api.get(`/products/${id}/reviews`);
