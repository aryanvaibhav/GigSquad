import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;