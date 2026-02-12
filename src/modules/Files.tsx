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
}

type SortType = "name" | "date" | "size" | "type";

export const Files: React.FC<FilesProps> = ({ items, withActions, defaultFilter = "all" }) => {
  const [files, setFiles] = React.useState(items || []);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
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
    if (type === "select") {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((_id) => _id !== id));
    }
  };

  const onClickRemove = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Api.files.remove(selectedIds);
      setFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
      const removedCount = selectedIds.length;
      setSelectedIds([]);
      toast.success(`Удалено файлов: ${removedCount}`);
      
      // Обновляем список файлов
      try {
        const updatedFiles = await Api.files.getAll();
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
        const fileName = (file.originalName || "").toLowerCase();
        return fileName.includes(searchQuery.toLowerCase());
      });
    }

    // Сортировка
    result.sort((a, b) => {
      switch (sortType) {
        case "name":
          const nameA = (a.originalName || "").trim();
          const nameB = (b.originalName || "").trim();
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

  return (
    <div>
      {withActions && (
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSearch={onSearch}
          selectedCount={selectedIds.length}
          onDownload={onClickDownload}
          onDelete={onClickRemove}
          onShare={onClickShare}
          onSort={onSort}
          onFilter={setFileFilter}
          currentFilter={fileFilter}
          isDownloading={isDownloading}
        />
      )}
      
      {sortedAndFilteredFiles.length ? (
        <FileList
          items={sortedAndFilteredFiles}
          viewMode={viewMode}
          onFileSelect={(id: string, type: FileSelectType) => onFileSelect(Number(id), type)}
          onFileClick={async (file) => {
            // Если файл не выбран, скачиваем его при клике
            if (!selectedIds.includes(file.id)) {
              try {
                setIsDownloading(true);
                await Api.files.downloadFile(file.filename, file.originalName);
                toast.success("Файл скачан");
              } catch (error) {
                console.error("Download error:", error);
                toast.error("Не удалось скачать файл");
              } finally {
                setIsDownloading(false);
              }
            }
          }}
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
