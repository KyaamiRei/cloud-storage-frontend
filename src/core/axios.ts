import axios from "axios";
import { parseCookies, destroyCookie } from "nookies";
import { logger } from "@/utils/logger";

// Используем переменную окружения или fallback на localhost
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Interceptor для добавления токена авторизации
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const { _token } = parseCookies();

      if (_token) {
        config.headers.Authorization = "Bearer " + _token;
      }
    }

    return config;
  },
  (error) => {
    logger.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Обработка 401 (Unauthorized) - перенаправление на страницу входа
    if (status === 401) {
      if (typeof window !== "undefined") {
        destroyCookie(null, "_token", { path: "/" });
        window.location.href = "/dashboard/auth";
      }
    }

    // Логирование ошибок
    if (status >= 500) {
      logger.error("Server error:", error.response?.data || error.message);
    } else if (status >= 400) {
      logger.warn("Client error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default axios;
