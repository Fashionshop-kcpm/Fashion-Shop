import api from "./axios";

export const getContacts = (params) => api.get("/contacts", { params });
export const updateContactStatus = (id, status) => api.patch(`/contacts/${id}/status`, { status });
