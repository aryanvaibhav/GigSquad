import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = new AxiosHeaders({
      ...config.headers,
      Authorization: `Bearer ${token}`,
    });
  }

  console.log("API DEBUG:", config.url, config.data);

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
