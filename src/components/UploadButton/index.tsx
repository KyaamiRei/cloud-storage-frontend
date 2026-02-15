import { CloudUploadOutlined } from "@ant-design/icons";
import { Button, Upload, UploadFile } from "antd";
import React, { useState, useCallback } from "react";
import styles from "./UploadButton.module.scss";
import * as Api from "@/api";
import { useFilesStore } from "@/store/filesStore";
import toast from "react-hot-toast";
import { logger } from "@/utils/logger";

export const UploadButton: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { setFiles } = useFilesStore();

  const refreshFiles = useCallback(async () => {
    try {
      const updatedFiles = await Api.files.getAll();
      setFiles(updatedFiles);
    } catch (error) {
      logger.error("Failed to refresh files after upload:", error);
      // Не показываем ошибку пользователю, т.к. файл уже загружен
    }
  }, [setFiles]);

  const onUploadSuccess = useCallback(
    async (options: any) => {
      setIsUploading(true);
      try {
        await Api.files.uploadFile(options);
        setFileList([]);
        toast.success("Файл успешно загружен");

        // Обновляем список файлов через store вместо перезагрузки страницы
        await refreshFiles();
      } catch (error: any) {
        logger.error("Upload error:", error);
        const errorMessage =
          error.response?.data?.message || "Не удалось загрузить файл";
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [refreshFiles]
  );

  return (
    <div className={styles.uploadWrapper}>
      <Upload
        customRequest={onUploadSuccess}
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        className={styles.upload}
        showUploadList={false}
        multiple>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          size="large"
          loading={isUploading}
          className={styles.uploadButton}
          block>
          {isUploading ? "Загрузка..." : "Загрузить файл"}
        </Button>
      </Upload>
    </div>
  );
};
