import axios from "@/core/axios";
import { FileItem } from "./dto/files.dto";

type FileType = "all" | "photo" | "trash";

export const getAll = async (type: FileType = "all"): Promise<FileItem[]> => {
  return (await axios.get("/files?type=" + type)).data;
};

export const remove = (ids: number[]): Promise<void> => {
  return axios.delete("/files?ids=" + ids);
};

export const downloadFile = async (filename: string, originalName: string): Promise<void> => {
  try {
    if (typeof window === "undefined") {
      throw new Error("Download is only available in browser");
    }

    // Пробуем несколько вариантов endpoint'ов
    let response;
    let downloadUrl = `/files/download?filename=${encodeURIComponent(filename)}`;
    
    try {
      // Пробуем основной endpoint
      response = await axios.get(downloadUrl, {
        responseType: "blob",
      });
    } catch (firstError: any) {
      // Если не получилось, пробуем альтернативный endpoint
      if (firstError.response?.status === 404) {
        console.log("Trying alternative download endpoint...");
        downloadUrl = `/uploads/${encodeURIComponent(filename)}`;
        response = await axios.get(downloadUrl, {
          responseType: "blob",
        });
      } else {
        throw firstError;
      }
    }

    // Проверяем, что получили данные
    if (!response.data || response.data.size === 0) {
      throw new Error("Получен пустой файл");
    }

    // Создаем blob из ответа
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });

    // Создаем временную ссылку для скачивания
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = originalName || filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    
    // Очищаем после скачивания
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error: any) {
    console.error("Download error:", error);
    console.error("Filename:", filename);
    console.error("Original name:", originalName);
    
    let errorMessage = "Не удалось скачать файл";
    
    // Пытаемся получить текст ошибки из ответа
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Если не удалось распарсить, используем стандартное сообщение
      }
    } else if (error.response?.status === 404) {
      errorMessage = "Файл не найден на сервере";
    } else if (error.response?.status === 403) {
      errorMessage = "Нет доступа к файлу";
    } else if (error.response?.status === 401) {
      errorMessage = "Требуется авторизация";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const downloadFiles = async (files: FileItem[]): Promise<void> => {
  for (const file of files) {
    try {
      await downloadFile(file.filename, file.originalName);
      // Небольшая задержка между скачиваниями
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download ${file.originalName}:`, error);
      throw error;
    }
  }
};

export const uploadFile = async (options: any) => {
  const { onSuccess, onError, file, onProgress } = options;

  const formData = new FormData();
  formData.append("file", file);

  const config = {
    headers: { "Content-Type": "multipart/form-data" },
    onProgress: (event: ProgressEvent) => {
      onProgress({ percent: (event.loaded / event.total) * 100 });
    },
  };

  try {
    const { data } = await axios.post("files", formData, config);

    onSuccess();

    return data;
  } catch (err) {
    onError({ err });
  }
};
