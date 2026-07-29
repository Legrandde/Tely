import axios from "axios";
import { getAccess, clearAccess } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// Injecte le token sur chaque requête
api.interceptors.request.use(
  (config) => {
    const token = getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 = token invalide/expiré/révoqué -> logout forcé
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccess();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;