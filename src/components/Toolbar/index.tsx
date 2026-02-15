import React from "react";
import { Button, Space, Dropdown, Input, Popconfirm } from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  SortAscendingOutlined,
  FilterOutlined,
  MoreOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  SearchOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FileZipOutlined,
  FileOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import styles from "./Toolbar.module.scss";
import { FileCategory, getFileCategoryLabel } from "@/utils/getFileType";

export type ViewMode = "grid" | "list";

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearch?: (value: string) => void;
  selectedCount?: number;
  totalCount?: number; // Общее количество файлов для "Выделить все"
  onSelectAll?: () => void; // Выделить все файлы
  onDeselectAll?: () => void; // Снять выделение со всех
  onDownload?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onRestore?: () => void; // Восстановление файлов
  hideDownload?: boolean; // Скрыть кнопку скачать
  hideShare?: boolean; // Скрыть кнопку поделиться
  onSort?: (type: "name" | "date" | "size" | "type") => void;
  onFilter?: (category: FileCategory) => void;
  currentFilter?: FileCategory;
  isDownloading?: boolean;
  deleteTitle?: string; // Кастомный заголовок для удаления
  deleteDescription?: string; // Кастомное описание для удаления
  deleteButtonText?: string; // Кастомный текст кнопки удаления
}

const sortMenuItems = [
  { key: "name", label: "По имени" },
  { key: "date", label: "По дате" },
  { key: "size", label: "По размеру" },
  { key: "type", label: "По типу" },
];

const filterMenuItems = [
  { 
    key: "all", 
    label: getFileCategoryLabel("all"),
    icon: <FileOutlined />,
  },
  { 
    key: "image", 
    label: getFileCategoryLabel("image"),
    icon: <FileImageOutlined />,
  },
  { 
    key: "document", 
    label: getFileCategoryLabel("document"),
    icon: <FileTextOutlined />,
  },
  { 
    key: "video", 
    label: getFileCategoryLabel("video"),
    icon: <PlayCircleOutlined />,
  },
  { 
    key: "audio", 
    label: getFileCategoryLabel("audio"),
    icon: <SoundOutlined />,
  },
  { 
    key: "archive", 
    label: getFileCategoryLabel("archive"),
    icon: <FileZipOutlined />,
  },
  { 
    key: "other", 
    label: getFileCategoryLabel("other"),
    icon: <FileOutlined />,
  },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onSearch,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  onDeselectAll,
  onDownload,
  onDelete,
  onShare,
  onRestore,
  onSort,
  onFilter,
  currentFilter = "all",
  isDownloading = false,
  deleteTitle = "Удалить выбранные файлы?",
  deleteDescription,
  deleteButtonText = "Удалить",
  hideDownload = false,
  hideShare = false,
}) => {
  const hasSelection = selectedCount > 0;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        {hasSelection ? (
          <Space>
            <span className={styles.selectionText}>
              Выбрано: {selectedCount}
              {totalCount > 0 && ` из ${totalCount}`}
            </span>
            {onDeselectAll && (
              <Button
                type="text"
                icon={<BorderOutlined />}
                onClick={onDeselectAll}
                className={styles.actionButton}
                title="Снять выделение">
                Снять выделение
              </Button>
            )}
            {onRestore && (
              <Button
                type="text"
                icon={<UndoOutlined />}
                onClick={onRestore}
                className={styles.actionButton}>
                Восстановить
              </Button>
            )}
            {onDownload && !hideDownload && (
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={onDownload}
                loading={isDownloading}
                disabled={isDownloading}
                className={styles.actionButton}>
                {isDownloading ? "Скачивание..." : "Скачать"}
              </Button>
            )}
            {onShare && !hideShare && (
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={onShare}
                className={styles.actionButton}>
                Поделиться
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title={deleteTitle}
                description={deleteDescription || `Будет удалено файлов: ${selectedCount}`}
                onConfirm={onDelete}
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className={styles.actionButton}>
                  {deleteButtonText}
                </Button>
              </Popconfirm>
            )}
          </Space>
        ) : (
          <Space>
            {onSelectAll && totalCount > 0 && (
              <Button
                type="text"
                icon={<CheckSquareOutlined />}
                onClick={onSelectAll}
                className={styles.actionButton}
                title="Выделить все (Ctrl+A)">
                Выделить все
              </Button>
            )}
            <div className={styles.searchContainer}>
              <Input
                placeholder="Поиск в файлах..."
                allowClear
                onChange={(e) => onSearch?.(e.target.value)}
                onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
                className={styles.search}
                prefix={<SearchOutlined />}
              />
            </div>
          </Space>
        )}
      </div>

      <div className={styles.right}>
        <Space>
          <Dropdown
            menu={{
              items: sortMenuItems,
              onClick: ({ key }) => {
                onSort?.(key as "name" | "date" | "size" | "type");
              },
            }}
            trigger={["click"]}>
            <Button
              type="text"
              icon={<SortAscendingOutlined />}
              className={styles.textButton}>
              Сортировка
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: filterMenuItems,
              selectedKeys: [currentFilter],
              onClick: ({ key }) => {
                onFilter?.(key as FileCategory);
              },
            }}
            trigger={["click"]}>
            <Button
              type={currentFilter !== "all" ? "primary" : "text"}
              icon={<FilterOutlined />}
              className={styles.textButton}>
              Фильтры {currentFilter !== "all" && `(${getFileCategoryLabel(currentFilter)})`}
            </Button>
          </Dropdown>

          <div className={styles.viewModeButtons}>
            <Button
              type={viewMode === "grid" ? "primary" : "text"}
              icon={<AppstoreOutlined />}
              onClick={() => onViewModeChange("grid")}
              className={styles.viewButton}
            />
            <Button
              type={viewMode === "list" ? "primary" : "text"}
              icon={<UnorderedListOutlined />}
              onClick={() => onViewModeChange("list")}
              className={styles.viewButton}
            />
          </div>

          <Button
            type="text"
            icon={<MoreOutlined />}
            className={styles.iconButton}
          />
        </Space>
      </div>
    </div>
  );
};
