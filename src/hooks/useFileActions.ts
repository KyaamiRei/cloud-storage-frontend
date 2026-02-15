import { useCallback } from "react";
import { useFilesStore } from "@/store/filesStore";
import { useUIStore } from "@/store/uiStore";
import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import toast from "react-hot-toast";

type FileType = "all" | "photo" | "trash" | "favorites";

interface UseFileActionsOptions {
  fileType?: FileType;
  onSuccess?: () => void;
}

/**
 * Хук для работы с действиями над файлами (удаление, восстановление, скачивание)
 */
export const useFileActions = (options: UseFileActionsOptions = {}) => {
  const { fileType = "all", onSuccess } = options;
  const { setFiles, removeFile } = useFilesStore();
  const { selectedFileIds, deselectAll } = useUIStore();

  const removeFiles = useCallback(
    async (ids: number[], permanent = false) => {
      if (ids.length === 0) return;

      try {
        if (permanent) {
          await Api.files.removePermanently(ids);
        } else {
          await Api.files.remove(ids);
        }

        // Обновляем store
        ids.forEach((id) => removeFile(id));
        deselectAll();

        const removedCount = ids.length;
        toast.success(`Удалено файлов: ${removedCount}`);

        // Обновляем список файлов с сервера
        try {
          const updatedFiles = await Api.files.getAll(fileType);
          setFiles(updatedFiles);
        } catch (error) {
          console.error("Failed to refresh files:", error);
        }

        onSuccess?.();
      } catch (error: any) {
        console.error("Failed to remove files:", error);
        toast.error(error.response?.data?.message || "Не удалось удалить файлы");
      }
    },
    [fileType, removeFile, setFiles, deselectAll, onSuccess]
  );

  const restoreFiles = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;

      try {
        await Api.files.restore(ids);

        // Обновляем список файлов с сервера
        try {
          const updatedFiles = await Api.files.getAll(fileType);
          setFiles(updatedFiles);
        } catch (error) {
          console.error("Failed to refresh files:", error);
        }

        deselectAll();
        const restoredCount = ids.length;
        toast.success(`Восстановлено файлов: ${restoredCount}`);

        onSuccess?.();
      } catch (error: any) {
        console.error("Failed to restore files:", error);
        toast.error(error.response?.data?.message || "Не удалось восстановить файлы");
      }
    },
    [fileType, setFiles, deselectAll, onSuccess]
  );

  const downloadFiles = useCallback(async (files: FileItem[]) => {
    if (files.length === 0) return;

    try {
      if (files.length === 1) {
        await Api.files.downloadFile(files[0].filename, files[0].originalName);
        toast.success("Файл скачан");
      } else {
        await Api.files.downloadFiles(files);
        toast.success(`Скачано файлов: ${files.length}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Не удалось скачать файлы");
    }
  }, []);

  return {
    removeFiles,
    restoreFiles,
    downloadFiles,
    selectedFileIds,
  };
};
