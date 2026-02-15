import { create } from "zustand";
import { FileCategory } from "@/utils/getFileType";

type ViewMode = "grid" | "list";
type SortType = "name" | "date" | "size" | "type";

interface UIStore {
  // Состояние выбранных файлов
  selectedFileIds: number[];
  
  // Состояние UI
  viewMode: ViewMode;
  searchQuery: string;
  sortType: SortType;
  fileFilter: FileCategory;
  
  // Действия для выбранных файлов
  selectFile: (id: number) => void;
  deselectFile: (id: number) => void;
  selectAll: (ids: number[]) => void;
  deselectAll: () => void;
  toggleSelect: (id: number) => void;
  
  // Действия для UI
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSortType: (type: SortType) => void;
  setFileFilter: (filter: FileCategory) => void;
  
  // Вспомогательные методы
  isSelected: (id: number) => boolean;
  hasSelection: () => boolean;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Начальное состояние
  selectedFileIds: [],
  viewMode: "grid",
  searchQuery: "",
  sortType: "name",
  fileFilter: "all",

  // Выбрать файл
  selectFile: (id) =>
    set((state) => ({
      selectedFileIds: state.selectedFileIds.includes(id)
        ? state.selectedFileIds
        : [...state.selectedFileIds, id],
    })),

  // Снять выбор с файла
  deselectFile: (id) =>
    set((state) => ({
      selectedFileIds: state.selectedFileIds.filter((fileId) => fileId !== id),
    })),

  // Выбрать все файлы
  selectAll: (ids) => set({ selectedFileIds: ids }),

  // Снять выбор со всех файлов
  deselectAll: () => set({ selectedFileIds: [] }),

  // Переключить выбор файла
  toggleSelect: (id) =>
    set((state) => {
      const isSelected = state.selectedFileIds.includes(id);
      return {
        selectedFileIds: isSelected
          ? state.selectedFileIds.filter((fileId) => fileId !== id)
          : [...state.selectedFileIds, id],
      };
    }),

  // Установить режим просмотра
  setViewMode: (mode) => set({ viewMode: mode }),

  // Установить поисковый запрос
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Установить тип сортировки
  setSortType: (type) => set({ sortType: type }),

  // Установить фильтр файлов
  setFileFilter: (filter) => set({ fileFilter: filter }),

  // Проверить, выбран ли файл
  isSelected: (id) => {
    const state = get();
    return state.selectedFileIds.includes(id);
  },

  // Проверить, есть ли выбранные файлы
  hasSelection: () => {
    const state = get();
    return state.selectedFileIds.length > 0;
  },
}));
