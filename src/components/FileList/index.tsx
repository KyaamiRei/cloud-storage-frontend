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
  viewMode = "grid"
}) => {
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

  const handleFileClick = useCallback(
    (item: FileItem) => {
      if (onFileClick) {
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
            onClick={() => handleFileClick(record)}
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
          onRow={(record) => ({
            onClick: () => handleFileClick(record),
            className: styles.tableRow,
          })}
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {items.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
          className={styles.fileItem}>
          <FileCard
            filename={item.filename}
            originalName={item.originalName}
            size={item.size}
            onClick={() => handleFileClick(item)}
          />
        </div>
      ))}

      <Selecto
        selectableTargets={[`.${styles.fileItem}`]}
        selectByClick
        hitRate={10}
        selectFromInside
        toggleContinueSelect={["shift"]}
        continueSelect={false}
        onSelect={handleSelect}
      />
    </div>
  );
};
