import React, { useCallback } from "react";
import styles from "./FileList.module.scss";
import { FileItem } from "@/api/dto/files.dto";
import { FileCard } from "@/components/FileCard";
import Selecto from "react-selecto";
import { ViewMode } from "@/components/Toolbar";
import { Table } from "antd";
import { getExtensionFromFileName } from "@/utils/getExtensionFromFileName";

export type FileSelectType = "select" | "unselect";

interface FileListProps {
  items: FileItem[];
  onFileSelect: (id: string, type: FileSelectType) => void;
  onFileClick?: (item: FileItem) => void;
  viewMode?: ViewMode;
  selectedIds?: number[];
  onToggleFavorite?: (id: number) => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const FileList: React.FC<FileListProps> = ({ 
  items, 
  onFileSelect, 
  onFileClick,
  viewMode = "grid",
  selectedIds = [],
  onToggleFavorite,
}) => {
  const lastSelectedIndexRef = React.useRef<number>(-1);

  const handleSelect = useCallback(
    (e: { added: (HTMLElement | SVGElement)[]; removed: (HTMLElement | SVGElement)[] }) => {
      e.added.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.classList.add("active");
          const id = el.dataset["id"];
          if (id) {
            onFileSelect(id, "select");
          }
        }
      });

      e.removed.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.classList.remove("active");
          const id = el.dataset["id"];
          if (id) {
            onFileSelect(id, "unselect");
          }
        }
      });
    },
    [onFileSelect],
  );

  const handleFileSelectWithShift = useCallback(
    (id: number, event: React.MouseEvent) => {
      if (event.shiftKey && lastSelectedIndexRef.current >= 0) {
        // Выделяем диапазон от последнего выбранного до текущего
        const currentIndex = items.findIndex((item) => item.id === id);
        const startIndex = Math.min(lastSelectedIndexRef.current, currentIndex);
        const endIndex = Math.max(lastSelectedIndexRef.current, currentIndex);

        for (let i = startIndex; i <= endIndex; i++) {
          const itemId = items[i].id;
          if (!selectedIds.includes(itemId)) {
            onFileSelect(String(itemId), "select");
          }
        }
      } else {
        // Обычное выделение
        const isSelected = selectedIds.includes(id);
        onFileSelect(String(id), isSelected ? "unselect" : "select");
        const currentIndex = items.findIndex((item) => item.id === id);
        if (currentIndex >= 0) {
          lastSelectedIndexRef.current = currentIndex;
        }
      }
    },
    [items, selectedIds, onFileSelect],
  );

  const handleFileClick = useCallback(
    (item: FileItem, event?: React.MouseEvent) => {
      if (onFileClick) {
        // Предотвращаем всплытие события
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        onFileClick(item);
      }
    },
    [onFileClick],
  );

  if (!items || items.length === 0) {
    return null;
  }

  if (viewMode === "list") {
    const columns = [
      {
        title: "Имя",
        dataIndex: "originalName",
        key: "name",
        render: (text: string, record: FileItem) => (
          <div 
            className={styles.listFileName}
            onClick={(e) => {
              const isSelected = selectedIds.includes(record.id);
              if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd + клик: переключаем выделение
                handleFileSelectWithShift(record.id, e);
              } else if (e.shiftKey) {
                // Shift + клик: выделяем диапазон
                handleFileSelectWithShift(record.id, e);
              } else if (isSelected && onFileClick) {
                // Если файл уже выбран, выполняем действие
                handleFileClick(record, e);
              } else {
                // Обычный клик: выделяем файл
                handleFileSelectWithShift(record.id, e);
              }
            }}
          >
            <span className={styles.listFileExtension}>
              {getExtensionFromFileName(record.filename)?.toUpperCase() || "FILE"}
            </span>
            <span className={styles.listFileNameText}>{text}</span>
          </div>
        ),
      },
      {
        title: "Размер",
        dataIndex: "size",
        key: "size",
        width: 120,
        render: (size: number) => formatFileSize(size),
      },
      {
        title: "Дата",
        dataIndex: "deletedAt",
        key: "date",
        width: 150,
        render: (date: string | null) => {
          if (!date) return "-";
          return new Date(date).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
      },
    ];

    return (
      <div className={styles.listContainer}>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          pagination={false}
          className={styles.table}
          onRow={(record) => {
            const isSelected = selectedIds.includes(record.id);
            return {
              onClick: (e: any) => {
                if (e.ctrlKey || e.metaKey) {
                  // Ctrl/Cmd + клик: переключаем выделение
                  handleFileSelectWithShift(record.id, e);
                } else if (e.shiftKey) {
                  // Shift + клик: выделяем диапазон
                  handleFileSelectWithShift(record.id, e);
                } else if (isSelected && onFileClick) {
                  // Если файл уже выбран, выполняем действие
                  handleFileClick(record, e);
                } else {
                  // Обычный клик: выделяем файл
                  handleFileSelectWithShift(record.id, e);
                }
              },
              className: `${styles.tableRow} ${isSelected ? styles.selected : ""}`,
            };
          }}
        />
      </div>
    );
  }

  // Синхронизируем класс active с selectedIds
  React.useEffect(() => {
    items.forEach((item) => {
      const element = document.querySelector(`[data-id="${item.id}"]`);
      if (element) {
        if (selectedIds.includes(item.id)) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      }
    });
  }, [items, selectedIds]);

  return (
    <div className={styles.root}>
      {items.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
          className={`${styles.fileItem} ${selectedIds.includes(item.id) ? "active" : ""}`}>
          <FileCard
            filename={item.filename}
            originalName={item.originalName}
            size={item.size}
            isFavorite={item.isFavorite || false}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.id) : undefined}
            isSelected={selectedIds.includes(item.id)}
            onClick={(e) => {
              // Предотвращаем всплытие и конфликт с Selecto
              e.stopPropagation();
              e.preventDefault();
              
              const isSelected = selectedIds.includes(item.id);
              
              if (e.ctrlKey || e.metaKey) {
                // Ctrl/Cmd + клик: переключаем выделение
                handleFileSelectWithShift(item.id, e);
              } else if (e.shiftKey) {
                // Shift + клик: выделяем диапазон
                handleFileSelectWithShift(item.id, e);
              } else if (isSelected && onFileClick) {
                // Если файл уже выбран, выполняем действие (например, открыть)
                handleFileClick(item, e);
              } else {
                // Обычный клик: выделяем файл
                handleFileSelectWithShift(item.id, e);
              }
            }}
          />
        </div>
      ))}

      <Selecto
        selectableTargets={[`.${styles.fileItem}`]}
        selectByClick={false}
        hitRate={10}
        selectFromInside={false}
        toggleContinueSelect={["shift", "ctrl"]}
        continueSelect={false}
        onSelect={handleSelect}
        preventClickEventOnDrag={true}
        preventDefaultOnDrag={true}
      />
    </div>
  );
};
