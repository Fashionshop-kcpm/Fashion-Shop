import api from "./axios";

export const getUsers = (params) => api.get("/users", { params });
export const getUser = (id) => api.get(`/users/${id}`);
