import React, { useCallback } from "react";
import styles from "./FileList.module.scss";
import { FileItem } from "@/api/dto/files.dto";
import { FileCard } from "@/components/FileCard";
import Selecto from "react-selecto";

export type FileSelectType = "select" | "unselect";

interface FileListProps {
  items: FileItem[];
  onFileSelect: (id: string, type: FileSelectType) => void;
  onFileClick?: (item: FileItem) => void;
}

export const FileList: React.FC<FileListProps> = ({ items, onFileSelect, onFileClick }) => {
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
