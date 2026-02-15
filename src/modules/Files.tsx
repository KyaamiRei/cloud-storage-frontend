import React from "react";
import { FileItem } from "@/api/dto/files.dto";
import { FileList, FileSelectType } from "@/components/FileList";
import { Empty, Modal, Input } from "antd";
import { Toolbar, ViewMode } from "@/components/Toolbar";
import toast from "react-hot-toast";
import { FileCategory, getFileCategory } from "@/utils/getFileType";

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
  const [files, setFiles] = React.useState(items || []);
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<number[]>([]);
  
  // Используем внешние selectedIds, если они переданы, иначе внутренние
  const selectedIds = externalSelectedIds !== undefined ? externalSelectedIds : internalSelectedIds;
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortType, setSortType] = React.useState<SortType>("name");
  const [fileFilter, setFileFilter] = React.useState<FileCategory>(defaultFilter);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [shareModalVisible, setShareModalVisible] = React.useState(false);
  const [shareLink, setShareLink] = React.useState("");

  // Обновляем файлы при изменении items
  React.useEffect(() => {
    setFiles(items || []);
  }, [items]);

  const onFileSelect = (id: number, type: FileSelectType) => {
    if (externalOnFileSelect) {
      // Если передан внешний обработчик, используем его
      externalOnFileSelect(id, type);
    } else {
      // Иначе используем внутреннее состояние
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
      setFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
      const removedCount = selectedIds.length;
      if (externalSelectedIds === undefined) {
        setInternalSelectedIds([]);
      }
      toast.success(`Удалено файлов: ${removedCount}`);

      // Обновляем список файлов с правильным типом
      try {
        const updatedFiles = await Api.files.getAll(fileType);
        setFiles(updatedFiles);
      } catch (error) {
        console.error("Failed to refresh files:", error);
      }
    } catch (error) {
      console.error("Failed to remove files:", error);
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
      console.error("Download error:", error);
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
    setSearchQuery(value);
  };

  const onSort = (type: SortType) => {
    setSortType(type);
  };

  const handleToggleFavorite = async (id: number) => {
    if (externalOnToggleFavorite) {
      externalOnToggleFavorite(id);
    } else {
      try {
        const updatedFile = await Api.files.toggleFavorite(id);
        // Обновляем файл в списке
        setFiles((prev) =>
          prev.map((file) => (file.id === id ? { ...file, isFavorite: updatedFile.isFavorite } : file))
        );
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        toast.error("Не удалось изменить статус избранного");
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
        setFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
        const restoredCount = selectedIds.length;
        if (externalSelectedIds === undefined) {
          setInternalSelectedIds([]);
        }
        toast.success(`Восстановлено файлов: ${restoredCount}`);

        // Обновляем список файлов с правильным типом
        try {
          const updatedFiles = await Api.files.getAll(fileType);
          setFiles(updatedFiles);
        } catch (error) {
          console.error("Failed to refresh files:", error);
        }
      } catch (error: any) {
        console.error("Failed to restore files:", error);
        toast.error(error.response?.data?.message || "Не удалось восстановить файлы");
      }
    }
  };

  const sortedAndFilteredFiles = React.useMemo(() => {
    let result = [...files];

    // Фильтрация по типу файла
    if (fileFilter !== "all") {
      result = result.filter((file) => {
        const category = getFileCategory(file.filename);
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
    } else {
      setInternalSelectedIds(allIds);
    }
  }, [sortedAndFilteredFiles, selectedIds, externalOnFileSelect]);

  const handleDeselectAll = React.useCallback(() => {
    if (externalOnFileSelect) {
      // Если есть внешний обработчик, вызываем его для каждого выбранного файла
      selectedIds.forEach((id) => {
        externalOnFileSelect(id, "unselect");
      });
    } else {
      setInternalSelectedIds([]);
    }
  }, [selectedIds, externalOnFileSelect]);

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
          onViewModeChange={setViewMode}
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
          onFilter={setFileFilter}
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
