import axios from "axios";

const api = axios.create({ baseURL: import.meta.env?.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(err) {
  return err.response?.data?.message || "Couldn't reach the server. Check that it's running.";
}

export default api;
