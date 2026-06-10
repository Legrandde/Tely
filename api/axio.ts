import axios from "axios";
import { getAccess } from "../utils/storage";
import dotenv from "dotenv"


const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token =  getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
