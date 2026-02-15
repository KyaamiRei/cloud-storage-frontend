import { useEffect } from "react";
import { useFilesStore } from "@/store/filesStore";
import { FileItem } from "@/api/dto/files.dto";

/**
 * Хук для инициализации файлов в store при загрузке страницы
 */
export const useFilesInitialization = (items: FileItem[] | undefined) => {
  const { setFiles } = useFilesStore();

  useEffect(() => {
    if (items && items.length > 0) {
      setFiles(items);
    }
  }, [items, setFiles]);
};
