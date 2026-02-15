import React from "react";
import { FileItem } from "@/api/dto/files.dto";
import { FileList, FileSelectType } from "@/components/FileList";
import { Empty, Modal, Input } from "antd";
import { Toolbar, ViewMode } from "@/components/Toolbar";
import toast from "react-hot-toast";
import { FileCategory, getFileCategory } from "@/utils/getFileType";
import { useFilesStore } from "@/store/filesStore";
import { useUIStore } from "@/store/uiStore";
import { logger } from "@/utils/logger";

import * as Api from "@/api";

interface FilesProps {
  items: FileItem[];
  withActions?: boolean;
  defaultFilter?: FileCategory;
  onFileSelect?: (id: number, type: FileSelectType) => void;
  selectedIds?: number[];
  fileType?: "all" | "photo" | "trash" | "favorites";
  disableDelete?: boolean; // Отключает удаление через Toolbar
  onDelete?: () => void; // Внешний обработчик удаления
  deleteTitle?: string; // Кастомный заголовок для удаления
  deleteDescription?: string; // Кастомное описание для удаления
  deleteButtonText?: string; // Кастомный текст кнопки удаления
  onToggleFavorite?: (id: number) => void; // Обработчик переключения избранного
  onRestore?: () => void; // Обработчик восстановления файлов
  hideDownload?: boolean; // Скрыть кнопку скачать
  hideShare?: boolean; // Скрыть кнопку поделиться
}

type SortType = "name" | "date" | "size" | "type";

export const Files: React.FC<FilesProps> = ({ 
  items, 
  withActions, 
  defaultFilter = "all",
  onFileSelect: externalOnFileSelect,
  selectedIds: externalSelectedIds,
  fileType = "all",
  disableDelete = false,
  onDelete: externalOnDelete,
  deleteTitle,
  deleteDescription,
  deleteButtonText,
  onToggleFavorite: externalOnToggleFavorite,
  onRestore: externalOnRestore,
  hideDownload = false,
  hideShare = false,
}) => {
  // Zustand stores
  const { 
    files: storeFiles, 
    setFiles: setStoreFiles, 
    removeFile: removeStoreFile,
    updateFile: updateStoreFile,
    toggleFileFavorite: toggleStoreFavorite,
    getFilesByType,
    getFileById
  } = useFilesStore();
  
  const {
    selectedFileIds: storeSelectedIds,
    selectFile: storeSelectFile,
    deselectFile: storeDeselectFile,
    selectAll: storeSelectAll,
    deselectAll: storeDeselectAll,
    viewMode: storeViewMode,
    setViewMode: setStoreViewMode,
    searchQuery: storeSearchQuery,
    setSearchQuery: setStoreSearchQuery,
    sortType: storeSortType,
    setSortType: setStoreSortType,
    fileFilter: storeFileFilter,
    setFileFilter: setStoreFileFilter,
  } = useUIStore();

  // Локальное состояние для обратной совместимости (когда используются внешние пропсы)
  const [localFiles, setLocalFiles] = React.useState<FileItem[]>(items || []);
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<number[]>([]);
  const [localViewMode, setLocalViewMode] = React.useState<ViewMode>("grid");
  const [localSearchQuery, setLocalSearchQuery] = React.useState("");
  const [localSortType, setLocalSortType] = React.useState<SortType>("name");
  const [localFileFilter, setLocalFileFilter] = React.useState<FileCategory>(defaultFilter);
  
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [shareModalVisible, setShareModalVisible] = React.useState(false);
  const [shareLink, setShareLink] = React.useState("");

  // Определяем, используем ли мы store или локальное состояние
  const useStore = externalSelectedIds === undefined && !externalOnFileSelect;
  
  // Выбираем источник данных
  // Приоритет: store (если используется и есть данные) > items > localFiles
  const files = useStore 
    ? (fileType === "all" 
        ? (storeFiles.length > 0 ? storeFiles : (items || []))
        : (() => {
            // Для специфичных типов (photo, trash, favorites) используем getFilesByType
            if (storeFiles.length > 0) {
              const storeFiltered = getFilesByType(fileType);
              // Если в store есть файлы нужного типа, используем их, иначе items
              return storeFiltered.length > 0 ? storeFiltered : (items || []);
            }
            // Если store пустой, используем items (они уже отфильтрованы на сервере)
            return items || [];
          })())
    : (localFiles.length > 0 ? localFiles : (items || []));
  const selectedIds = externalSelectedIds !== undefined 
    ? externalSelectedIds 
    : useStore 
      ? storeSelectedIds 
      : internalSelectedIds;
  const viewMode = useStore ? storeViewMode : localViewMode;
  const searchQuery = useStore ? storeSearchQuery : localSearchQuery;
  const sortType = useStore ? storeSortType : localSortType;
  // Используем defaultFilter если fileFilter в store равен "all" (начальное значение)
  // Это позволяет применять defaultFilter для страниц с фильтрами
  const fileFilter = useStore 
    ? (storeFileFilter === "all" && defaultFilter !== "all" ? defaultFilter : storeFileFilter)
    : (localFileFilter === "all" && defaultFilter !== "all" ? defaultFilter : localFileFilter);

  // Обновляем файлы при изменении items
  React.useEffect(() => {
    if (!items) return;
    
    if (useStore) {
      // Если используем store, обновляем его
      // Объединяем существующие файлы с новыми, чтобы не потерять данные
      const currentFiles = storeFiles;
      
      // Создаем Map для быстрого поиска существующих файлов
      const filesMap = new Map(currentFiles.map((f: FileItem) => [f.id, f]));
      // Обновляем или добавляем новые файлы
      items.forEach(item => {
        filesMap.set(item.id, item);
      });
      const newFiles = Array.from(filesMap.values());
      
      // Проверяем, действительно ли нужно обновлять (избегаем лишних обновлений)
      // Сравниваем только по количеству и ID, чтобы избежать лишних обновлений
      const currentIds = new Set(currentFiles.map(f => f.id));
      const newIds = new Set(newFiles.map(f => f.id));
      const hasChanges = currentIds.size !== newIds.size || 
        Array.from(newIds).some(id => !currentIds.has(id)) ||
        items.some(item => {
          const existing = currentFiles.find(f => f.id === item.id);
          return !existing || 
            existing.isFavorite !== item.isFavorite ||
            existing.deletedAt !== item.deletedAt;
        });
      
      if (hasChanges) {
        setStoreFiles(newFiles);
      }
    } else {
      // Иначе используем локальное состояние
      setLocalFiles(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, useStore, setStoreFiles]);

  const onFileSelect = (id: number, type: FileSelectType) => {
    if (externalOnFileSelect) {
      // Если передан внешний обработчик, используем его
      externalOnFileSelect(id, type);
    } else if (useStore) {
      // Используем store
      if (type === "select") {
        storeSelectFile(id);
      } else {
        storeDeselectFile(id);
      }
    } else {
      // Иначе используем локальное состояние
      if (type === "select") {
        setInternalSelectedIds((prev) => [...prev, id]);
      } else {
        setInternalSelectedIds((prev) => prev.filter((_id) => _id !== id));
      }
    }
  };

  const onClickRemove = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Api.files.remove(selectedIds);
      
      // Обновляем состояние
      if (useStore) {
        selectedIds.forEach((id) => removeStoreFile(id));
        storeDeselectAll();
      } else {
        setLocalFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
        if (externalSelectedIds === undefined) {
          setInternalSelectedIds([]);
        }
      }
      
      const removedCount = selectedIds.length;
      toast.success(`Удалено файлов: ${removedCount}`);

      // Обновляем список файлов с правильным типом
      try {
        const updatedFiles = await Api.files.getAll(fileType);
        if (useStore) {
          setStoreFiles(updatedFiles);
        } else {
          setLocalFiles(updatedFiles);
        }
      } catch (error) {
        logger.error("Failed to refresh files:", error);
      }
    } catch (error) {
      logger.error("Failed to remove files:", error);
      toast.error("Не удалось удалить файлы");
    }
  };

  const onClickDownload = async () => {
    if (selectedIds.length === 0) return;

    const selectedFiles = files.filter((file) => selectedIds.includes(file.id));

    if (selectedFiles.length === 0) {
      toast.error("Файлы не найдены");
      return;
    }

    setIsDownloading(true);
    try {
      if (selectedFiles.length === 1) {
        await Api.files.downloadFile(selectedFiles[0].filename, selectedFiles[0].originalName);
        toast.success("Файл скачан");
      } else {
        await Api.files.downloadFiles(selectedFiles);
        toast.success(`Скачано файлов: ${selectedFiles.length}`);
      }
    } catch (error) {
      logger.error("Download error:", error);
      toast.error("Не удалось скачать файлы");
    } finally {
      setIsDownloading(false);
    }
  };

  const onClickShare = () => {
    if (selectedIds.length === 0) return;

    const selectedFiles = files.filter((file) => selectedIds.includes(file.id));

    if (selectedFiles.length === 0) {
      toast.error("Файлы не найдены");
      return;
    }

    // Генерируем ссылку для общего доступа
    const fileIds = selectedFiles.map((f) => f.id).join(",");
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/share?files=${fileIds}`;

    setShareLink(link);
    setShareModalVisible(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Ссылка скопирована в буфер обмена");
  };

  const onSearch = (value: string) => {
    if (useStore) {
      setStoreSearchQuery(value);
    } else {
      setLocalSearchQuery(value);
    }
  };

  const onSort = (type: SortType) => {
    if (useStore) {
      setStoreSortType(type);
    } else {
      setLocalSortType(type);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    // Проверяем, не находится ли файл в корзине
    const file = files.find(f => f.id === id);
    if (file?.deletedAt) {
      toast.error("Нельзя добавить файл из корзины в избранное");
      return;
    }

    if (externalOnToggleFavorite) {
      externalOnToggleFavorite(id);
    } else {
      try {
        const updatedFile = await Api.files.toggleFavorite(id);
        // Обновляем файл в списке
        if (useStore) {
          updateStoreFile(id, { isFavorite: updatedFile.isFavorite });
        } else {
          setLocalFiles((prev) =>
            prev.map((file) => (file.id === id ? { ...file, isFavorite: updatedFile.isFavorite } : file))
          );
        }
        toast.success(updatedFile.isFavorite ? "Добавлено в избранное" : "Удалено из избранного");
      } catch (error: any) {
        logger.error("Failed to toggle favorite:", error);
        const errorMessage = error.response?.data?.message || error.message || "Не удалось изменить статус избранного";
        toast.error(errorMessage);
      }
    }
  };

  const onClickRestore = async () => {
    if (externalOnRestore) {
      externalOnRestore();
    } else {
      if (selectedIds.length === 0) return;

      try {
        await Api.files.restore(selectedIds);
        
        // Обновляем состояние
        if (useStore) {
          selectedIds.forEach((id) => {
            const file = getFileById(id);
            if (file) {
              updateStoreFile(id, { deletedAt: null });
            }
          });
          storeDeselectAll();
        } else {
          setLocalFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
          if (externalSelectedIds === undefined) {
            setInternalSelectedIds([]);
          }
        }
        
        const restoredCount = selectedIds.length;
        toast.success(`Восстановлено файлов: ${restoredCount}`);

        // Обновляем список файлов с правильным типом
        try {
          const updatedFiles = await Api.files.getAll(fileType);
          if (useStore) {
            setStoreFiles(updatedFiles);
          } else {
            setLocalFiles(updatedFiles);
          }
        } catch (error) {
          logger.error("Failed to refresh files:", error);
        }
      } catch (error: any) {
        logger.error("Failed to restore files:", error);
        toast.error(error.response?.data?.message || "Не удалось восстановить файлы");
      }
    }
  };

  const sortedAndFilteredFiles = React.useMemo(() => {
    let result = [...files];

    // Фильтрация по типу файла
    if (fileFilter !== "all") {
      result = result.filter((file) => {
        // Используем originalName для определения категории, так как filename может быть хешированным
        const category = getFileCategory(file.originalName || file.filename);
        return category === fileFilter;
      });
    }

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      result = result.filter((file) => {
        const fileName = (file.filename || "").toLowerCase();
        return fileName.includes(searchQuery.toLowerCase());
      });
    }

    // Сортировка
    result.sort((a, b) => {
      switch (sortType) {
        case "name":
          const nameA = (a.filename || "").trim();
          const nameB = (b.filename || "").trim();
          if (!nameA && !nameB) return 0;
          if (!nameA) return 1;
          if (!nameB) return -1;
          return nameA.localeCompare(nameB, "ru");
        case "size":
          const sizeA = a.size || 0;
          const sizeB = b.size || 0;
          return sizeB - sizeA;
        case "type":
          const extA = (a.filename || "").split(".").pop() || "";
          const extB = (b.filename || "").split(".").pop() || "";
          if (!extA && !extB) return 0;
          if (!extA) return 1;
          if (!extB) return -1;
          return extA.localeCompare(extB);
        case "date":
          // Используем deletedAt как дату создания, если нет другого поля
          const dateA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
          const dateB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, sortType, fileFilter]);

  // Обработчики для выделения всех/снятия выделения
  const handleSelectAll = React.useCallback(() => {
    const allIds = sortedAndFilteredFiles.map((file) => file.id);
    if (externalOnFileSelect) {
      // Если есть внешний обработчик, вызываем его для каждого файла
      allIds.forEach((id) => {
        if (!selectedIds.includes(id)) {
          externalOnFileSelect(id, "select");
        }
      });
    } else if (useStore) {
      storeSelectAll(allIds);
    } else {
      setInternalSelectedIds(allIds);
    }
  }, [sortedAndFilteredFiles, selectedIds, externalOnFileSelect, useStore, storeSelectAll]);

  const handleDeselectAll = React.useCallback(() => {
    if (externalOnFileSelect) {
      // Если есть внешний обработчик, вызываем его для каждого выбранного файла
      selectedIds.forEach((id) => {
        externalOnFileSelect(id, "unselect");
      });
    } else if (useStore) {
      storeDeselectAll();
    } else {
      setInternalSelectedIds([]);
    }
  }, [selectedIds, externalOnFileSelect, useStore, storeDeselectAll]);

  // Обработка Ctrl+A для выделения всех и Escape для снятия выделения
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        if (sortedAndFilteredFiles.length > 0) {
          handleSelectAll();
        }
      }
      // Escape для снятия выделения
      if (e.key === "Escape" && selectedIds.length > 0) {
        handleDeselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sortedAndFilteredFiles, selectedIds, handleSelectAll, handleDeselectAll]);

  return (
    <div>
      {withActions && (
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={useStore ? setStoreViewMode : setLocalViewMode}
          onSearch={onSearch}
          selectedCount={selectedIds.length}
          totalCount={sortedAndFilteredFiles.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={selectedIds.length > 0 ? handleDeselectAll : undefined}
          onDownload={onClickDownload}
          onDelete={disableDelete ? undefined : (externalOnDelete || onClickRemove)}
          onShare={onClickShare}
          onRestore={fileType === "trash" ? (externalOnRestore || onClickRestore) : undefined}
          hideDownload={hideDownload}
          hideShare={hideShare}
          onSort={onSort}
          onFilter={useStore ? setStoreFileFilter : setLocalFileFilter}
          currentFilter={fileFilter}
          isDownloading={isDownloading}
          deleteTitle={deleteTitle}
          deleteDescription={deleteDescription}
          deleteButtonText={deleteButtonText}
        />
      )}

      {sortedAndFilteredFiles.length ? (
        <FileList
          items={sortedAndFilteredFiles}
          viewMode={viewMode}
          onFileSelect={(id: string, type: FileSelectType) => {
            const numId = Number(id);
            onFileSelect(numId, type);
          }}
          selectedIds={selectedIds}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            padding: "40px",
          }}>
          <Empty
            description={
              <span
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                }}>
                {searchQuery ? "Файлы не найдены" : "Список файлов пуст"}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}

      <Modal
        title="Поделиться файлами"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        onOk={copyShareLink}
        okText="Копировать ссылку"
        cancelText="Закрыть">
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8, color: "var(--text-secondary)" }}>
            Скопируйте ссылку для общего доступа к файлам:
          </p>
          <Input
            value={shareLink}
            readOnly
            onClick={(e) => (e.target as HTMLInputElement).select()}
            style={{ fontFamily: "monospace" }}
          />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
          Примечание: ссылка будет работать только для авторизованных пользователей
        </p>
      </Modal>
    </div>
  );
};
