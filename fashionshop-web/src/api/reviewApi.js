import api from "./axios";

// POST /products/{id}/reviews
export const postReview = (productId, data) => api.post(`/products/${productId}/reviews`, data);
