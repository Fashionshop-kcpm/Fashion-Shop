import api from "./axios";

export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const placeOrder = (data) => api.post("/orders", data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);
