/**
 * Утилита для логирования с поддержкой разных окружений
 */
export const logger = {
  /**
   * Логирует информацию (только в development)
   */
  log: (...args: any[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },

  /**
   * Логирует ошибки (всегда)
   */
  error: (...args: any[]): void => {
    console.error(...args);
  },

  /**
   * Логирует предупреждения (только в development)
   */
  warn: (...args: any[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  },

  /**
   * Логирует отладочную информацию (только в development)
   */
  debug: (...args: any[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args);
    }
  },
};
