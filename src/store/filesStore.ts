import { create } from "zustand";
import { FileItem } from "@/api/dto/files.dto";

interface FilesStore {
  // Состояние
  files: FileItem[];
  isLoading: boolean;
  error: string | null;

  // Действия для работы с файлами
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  removeFile: (id: number) => void;
  updateFile: (id: number, updates: Partial<FileItem>) => void;
  toggleFileFavorite: (id: number) => void;
  
  // Действия для загрузки
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Вспомогательные методы
  getFileById: (id: number) => FileItem | undefined;
  getFilesByType: (type: "all" | "photo" | "trash" | "favorites") => FileItem[];
  clearFiles: () => void;
}

export const useFilesStore = create<FilesStore>((set, get) => ({
  // Начальное состояние
  files: [],
  isLoading: false,
  error: null,

  // Установить список файлов
  setFiles: (files) => set({ files, error: null }),

  // Добавить файл
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  // Удалить файл
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),

  // Обновить файл
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  // Переключить избранное
  toggleFileFavorite: (id) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      ),
    })),

  // Установить состояние загрузки
  setLoading: (isLoading) => set({ isLoading }),

  // Установить ошибку
  setError: (error) => set({ error }),

  // Получить файл по ID
  getFileById: (id) => {
    const state = get();
    return state.files.find((f) => f.id === id);
  },

  // Получить файлы по типу
  getFilesByType: (type) => {
    const state = get();
    if (type === "all") {
      return state.files.filter((f) => !f.deletedAt);
    }
    if (type === "photo") {
      return state.files.filter(
        (f) => !f.deletedAt && f.mimetype?.startsWith("image/")
      );
    }
    if (type === "trash") {
      return state.files.filter((f) => f.deletedAt !== null);
    }
    if (type === "favorites") {
      return state.files.filter((f) => !f.deletedAt && f.isFavorite);
    }
    return [];
  },

  // Очистить файлы
  clearFiles: () => set({ files: [], error: null }),
}));
