import api from "./axios";

export const getReviews = (params) => api.get("/reviews", { params });
export const replyReview = (id, shop_reply) => api.patch(`/reviews/${id}/reply`, { shop_reply });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
