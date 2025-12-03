import { CloudUploadOutlined } from "@ant-design/icons";
import { Button, Upload, UploadFile } from "antd";
import React, { useState } from "react";
import styles from "./UploadButton.module.scss";
import * as Api from "@/api";
import toast from "react-hot-toast";

export const UploadButton: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onUploadSuccess = async (options: any) => {
    setIsUploading(true);
    try {
      await Api.files.uploadFile(options);
      setFileList([]);
      toast.success("Файл успешно загружен");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error("Не удалось загрузить файл");
      setIsUploading(false);
    }
  };

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
