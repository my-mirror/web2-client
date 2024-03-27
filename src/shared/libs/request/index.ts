import axios from "axios";

export const APP_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const request = axios.create({
  baseURL: APP_API_BASE_URL,
});

request.interceptors.request.use((config) => {
  const auth_v1_token = sessionStorage.getItem("auth_v1_token");

  if (auth_v1_token) {
    config.headers.Authorization = auth_v1_token;
  }

  return config;
});
