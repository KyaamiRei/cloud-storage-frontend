import React from "react";
import Image from "next/image";
import styles from "./FileCard.module.scss";
import { getExtensionFromFileName } from "@/utils/getExtensionFromFileName";
import { isImage } from "@/utils/isImage";
import { getColorByExtension } from "@/utils/getColorByExtension";
import {
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";

interface FileCardProps {
  filename: string;
  originalName: string;
  size?: number;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  isSelected?: boolean; // Флаг выделения
  isInTrash?: boolean; // Файл в корзине
}

const getFileIcon = (ext: string | undefined) => {
  if (!ext) return <FileOutlined />;

  const extLower = ext.toLowerCase();
  switch (extLower) {
    case "pdf":
      return <FilePdfOutlined />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined />;
    case "doc":
    case "docx":
      return <FileWordOutlined />;
    case "zip":
    case "rar":
    case "7z":
      return <FileZipOutlined />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return <FileImageOutlined />;
    default:
      return <FileTextOutlined />;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const FileCard: React.FC<FileCardProps> = ({ 
  originalName, 
  filename, 
  size, 
  onClick,
  isFavorite = false,
  onToggleFavorite,
  isSelected = false,
  isInTrash = false,
}) => {
  const ext = getExtensionFromFileName(filename);
  const imageUrl = ext && isImage(ext) ? `http://localhost:3001/uploads/${filename}` : null;

  const color = getColorByExtension(ext) || "default";
  const classColor = styles[color as keyof typeof styles] || "";

  return (
    <div
      className={`${styles.root} ${isSelected ? styles.active : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}>
      <div className={styles.cardContent}>
        <div className={styles.iconWrapper}>
          {imageUrl ? (
            <div className={styles.imageContainer}>
              <Image
                className={styles.image}
                loader={() => imageUrl}
                src={imageUrl}
                alt={filename}
                fill
                unoptimized
                sizes="(max-width: 768px) 160px, 180px"
                style={{ objectFit: "cover" }}
              />
              <div className={styles.imageOverlay} />
            </div>
          ) : (
            <div className={styles.iconContainer}>{getFileIcon(ext)}</div>
          )}
          {ext && (
            <div className={`${styles.extensionBadge} ${classColor}`}>{ext.toUpperCase()}</div>
          )}
          {onToggleFavorite && !isInTrash && (
            <div 
              className={styles.favoriteButton}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(e);
              }}>
              {isFavorite ? (
                <StarFilled className={styles.favoriteIcon} />
              ) : (
                <StarOutlined className={styles.favoriteIcon} />
              )}
            </div>
          )}
        </div>

        <div className={styles.fileInfo}>
          <div
            className={styles.fileName}
            title={filename}>
            {filename}
          </div>
          {size !== undefined && <div className={styles.fileSize}>{formatFileSize(size)}</div>}
        </div>
      </div>
    </div>
  );
};
