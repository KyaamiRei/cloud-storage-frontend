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
} from "@ant-design/icons";
import styles from "./Toolbar.module.scss";
import { FileCategory, getFileCategoryLabel } from "@/utils/getFileType";

export type ViewMode = "grid" | "list";

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearch?: (value: string) => void;
  selectedCount?: number;
  onDownload?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onSort?: (type: "name" | "date" | "size" | "type") => void;
  onFilter?: (category: FileCategory) => void;
  currentFilter?: FileCategory;
  isDownloading?: boolean;
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
  onDownload,
  onDelete,
  onShare,
  onSort,
  onFilter,
  currentFilter = "all",
  isDownloading = false,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        {hasSelection ? (
          <Space>
            <span className={styles.selectionText}>
              Выбрано: {selectedCount}
            </span>
            {onDownload && (
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
            {onShare && (
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
                title="Удалить выбранные файлы?"
                description={`Будет удалено файлов: ${selectedCount}`}
                onConfirm={onDelete}
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className={styles.actionButton}>
                  Удалить
                </Button>
              </Popconfirm>
            )}
          </Space>
        ) : (
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
