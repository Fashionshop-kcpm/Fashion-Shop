import api from "./axios";

export const sendContact = (data) => api.post("/contacts", data);
