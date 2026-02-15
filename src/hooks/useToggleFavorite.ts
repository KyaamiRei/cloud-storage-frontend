import { useCallback } from "react";
import { useFilesStore } from "@/store/filesStore";
import * as Api from "@/api";
import toast from "react-hot-toast";
import { FileItem } from "@/api/dto/files.dto";

interface UseToggleFavoriteOptions {
  files: FileItem[];
  useStore?: boolean;
  onSuccess?: (file: FileItem) => void;
}

/**
 * Хук для переключения статуса избранного файла
 */
export const useToggleFavorite = (options: UseToggleFavoriteOptions) => {
  const { files, useStore = true, onSuccess } = options;
  const { updateFile } = useFilesStore();

  const toggleFavorite = useCallback(
    async (id: number) => {
      // Проверяем, не находится ли файл в корзине
      const file = files.find((f) => f.id === id);
      if (file?.deletedAt) {
        toast.error("Нельзя добавить файл из корзины в избранное");
        return;
      }

      try {
        const updatedFile = await Api.files.toggleFavorite(id);

        // Обновляем файл в store
        if (useStore) {
          updateFile(id, { isFavorite: updatedFile.isFavorite });
        }

        toast.success(
          updatedFile.isFavorite ? "Добавлено в избранное" : "Удалено из избранного"
        );

        onSuccess?.(updatedFile);
      } catch (error: any) {
        console.error("Failed to toggle favorite:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Не удалось изменить статус избранного";
        toast.error(errorMessage);
      }
    },
    [files, useStore, updateFile, onSuccess]
  );

  return { toggleFavorite };
};
