import React from "react";
import { Card, Row, Col, Statistic, Progress, Tag, Empty } from "antd";
import {
  FileOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FileZipOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  StarOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import { FileItem } from "@/api/dto/files.dto";
import { getFileCategory, FileCategory, getFileCategoryLabel } from "@/utils/getFileType";
import styles from "./Statistics.module.scss";

interface StatisticsProps {
  files: FileItem[];
  trashFiles?: FileItem[];
  favoriteFiles?: FileItem[];
}

interface CategoryStats {
  category: FileCategory;
  count: number;
  size: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getCategoryIcon = (category: FileCategory) => {
  switch (category) {
    case "image":
      return <FileImageOutlined />;
    case "document":
      return <FileTextOutlined />;
    case "video":
      return <PlayCircleOutlined />;
    case "audio":
      return <SoundOutlined />;
    case "archive":
      return <FileZipOutlined />;
    default:
      return <FileOutlined />;
  }
};

export const Statistics: React.FC<StatisticsProps> = ({ 
  files, 
  trashFiles = [], 
  favoriteFiles = [] 
}) => {
  // Фильтруем только активные файлы (не в корзине)
  const activeFiles = files.filter((file) => !file.deletedAt);
  
  // Подсчет общей статистики
  const totalFiles = activeFiles.length;
  const totalSize = activeFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const trashSize = trashFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const favoriteSize = favoriteFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  
  // Статистика по категориям
  const categoryStats = React.useMemo(() => {
    const stats: Record<FileCategory, CategoryStats> = {
      all: { category: "all", count: 0, size: 0 },
      image: { category: "image", count: 0, size: 0 },
      document: { category: "document", count: 0, size: 0 },
      video: { category: "video", count: 0, size: 0 },
      audio: { category: "audio", count: 0, size: 0 },
      archive: { category: "archive", count: 0, size: 0 },
      other: { category: "other", count: 0, size: 0 },
    };

    activeFiles.forEach((file) => {
      const category = getFileCategory(file.filename);
      stats[category].count++;
      stats[category].size += file.size || 0;
    });

    return Object.values(stats).filter((stat) => stat.count > 0);
  }, [activeFiles]);

  // Топ-5 категорий по размеру
  const topCategories = React.useMemo(() => {
    return [...categoryStats]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
  }, [categoryStats]);

  // Средний размер файла
  const averageFileSize = totalFiles > 0 ? totalSize / totalFiles : 0;

  // Процент использования хранилища (примерно, можно сделать динамическим)
  const storageUsed = totalSize;
  const storageTotal = 10 * 1024 * 1024 * 1024; // 10 GB
  const storagePercent = (storageUsed / storageTotal) * 100;

  return (
    <div className={styles.root}>
      <Row gutter={[16, 16]}>
        {/* Общая статистика */}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всего файлов"
              value={totalFiles}
              prefix={<FileOutlined />}
              valueStyle={{ color: "var(--primary-color)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Общий размер"
              value={formatBytes(totalSize)}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: "var(--primary-color)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Средний размер файла"
              value={formatBytes(averageFileSize)}
              valueStyle={{ color: "var(--primary-color)" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Использовано хранилища"
              value={formatBytes(storageUsed)}
              suffix={`/ ${formatBytes(storageTotal)}`}
              valueStyle={{ color: "var(--primary-color)" }}
            />
          </Card>
        </Col>

        {/* Прогресс использования хранилища */}
        <Col xs={24}>
          <Card title="Использование хранилища">
            <Progress
              percent={Math.min(storagePercent, 100)}
              status={storagePercent > 90 ? "exception" : storagePercent > 70 ? "active" : "normal"}
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
            />
            <div className={styles.storageInfo}>
              <span>Использовано: {formatBytes(storageUsed)}</span>
              <span>Свободно: {formatBytes(Math.max(0, storageTotal - storageUsed))}</span>
            </div>
          </Card>
        </Col>

        {/* Статистика по категориям */}
        <Col xs={24}>
          <Card title="Распределение по типам файлов">
            <Row gutter={[16, 16]}>
              {categoryStats.map((stat) => {
                const percent = totalSize > 0 ? (stat.size / totalSize) * 100 : 0;
                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={stat.category}>
                    <Card className={styles.categoryCard}>
                      <div className={styles.categoryHeader}>
                        {getCategoryIcon(stat.category)}
                        <span className={styles.categoryName}>
                          {getFileCategoryLabel(stat.category)}
                        </span>
                      </div>
                      <div className={styles.categoryStats}>
                        <div className={styles.categoryCount}>
                          <Tag color="blue">{stat.count} файлов</Tag>
                        </div>
                        <div className={styles.categorySize}>
                          {formatBytes(stat.size)}
                        </div>
                        <Progress
                          percent={percent}
                          showInfo={false}
                          strokeColor="var(--primary-color)"
                          size="small"
                        />
                        <div className={styles.categoryPercent}>
                          {percent.toFixed(1)}% от общего объема
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>

        {/* Топ категорий */}
        <Col xs={24} lg={12}>
          <Card title="Топ категорий по размеру">
            <div className={styles.topCategories}>
              {topCategories.map((stat, index) => {
                const percent = totalSize > 0 ? (stat.size / totalSize) * 100 : 0;
                return (
                  <div key={stat.category} className={styles.topCategoryItem}>
                    <div className={styles.topCategoryHeader}>
                      <span className={styles.topCategoryRank}>#{index + 1}</span>
                      <span className={styles.topCategoryIcon}>
                        {getCategoryIcon(stat.category)}
                      </span>
                      <span className={styles.topCategoryName}>
                        {getFileCategoryLabel(stat.category)}
                      </span>
                      <span className={styles.topCategorySize}>
                        {formatBytes(stat.size)}
                      </span>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeColor="var(--primary-color)"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Дополнительная информация */}
        <Col xs={24} lg={12}>
          <Card title="Дополнительная информация">
            <div className={styles.additionalInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Самый большой файл:</span>
                <span className={styles.infoValue}>
                  {activeFiles.length > 0
                    ? formatBytes(Math.max(...activeFiles.map((f) => f.size || 0)))
                    : "Нет файлов"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Самый маленький файл:</span>
                <span className={styles.infoValue}>
                  {activeFiles.length > 0
                    ? formatBytes(Math.min(...activeFiles.map((f) => f.size || 0)))
                    : "Нет файлов"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Файлов в корзине:</span>
                <span className={styles.infoValue}>
                  {trashFiles.length} ({formatBytes(trashSize)})
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Избранных файлов:</span>
                <span className={styles.infoValue}>
                  {favoriteFiles.length} ({formatBytes(favoriteSize)})
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Дополнительные карточки статистики */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardIcon}>
                <DeleteOutlined style={{ color: "#ff4d4f" }} />
              </div>
              <div className={styles.statCardInfo}>
                <div className={styles.statCardValue}>{trashFiles.length}</div>
                <div className={styles.statCardLabel}>Файлов в корзине</div>
                <div className={styles.statCardSubtext}>
                  {formatBytes(trashSize)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardIcon}>
                <StarOutlined style={{ color: "#faad14" }} />
              </div>
              <div className={styles.statCardInfo}>
                <div className={styles.statCardValue}>{favoriteFiles.length}</div>
                <div className={styles.statCardLabel}>Избранных файлов</div>
                <div className={styles.statCardSubtext}>
                  {formatBytes(favoriteSize)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardIcon}>
                <CloudOutlined style={{ color: "var(--primary-color)" }} />
              </div>
              <div className={styles.statCardInfo}>
                <div className={styles.statCardValue}>
                  {formatBytes(totalSize + trashSize)}
                </div>
                <div className={styles.statCardLabel}>Общий объем</div>
                <div className={styles.statCardSubtext}>
                  Включая корзину
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {totalFiles === 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card>
              <Empty
                description="Нет файлов для отображения статистики"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};
