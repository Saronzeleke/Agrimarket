import axios from "axios";
import { API_BASE_URL } from "../constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Read CSRF token from cookie and set as header
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      
      if (csrfToken) {
        config.headers["X-XSRF-TOKEN"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login (cookies will be cleared by backend)
      if (typeof window !== "undefined") {
        window.location.assign(new URL("/auth/login", window.location.origin));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
