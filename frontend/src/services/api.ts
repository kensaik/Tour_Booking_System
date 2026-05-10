import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    if (error.response && error.response.status === 403) {
      console.warn("Forbidden access:", error.response.data?.message);
    }
    return Promise.reject(error);
  },
);

export default api;
