import React from "react";
import styles from "./FileActions.module.scss";
import { Button, Popconfirm } from "antd";

interface FileActionsProps {
  onClickRemove: VoidFunction;
  onClickDownload?: VoidFunction;
  isActive: boolean;
  isDownload?: boolean;
}

export const FileActions: React.FC<FileActionsProps> = ({
  onClickRemove,
  onClickDownload,
  isActive,
  isDownload,
}) => {
  return (
    <div className={styles.root}>
      {isDownload ? (
        <Button
          onClick={onClickDownload}
          disabled={!isActive}>
          Скачать
        </Button>
      ) : (
        ""
      )}

      <Popconfirm
        title="Удалить файл(ы)?"
        description="Все файлы будут перемещены в корзину"
        okText="Да"
        cancelText="Нет"
        disabled={!isActive}
        onConfirm={onClickRemove}>
        <Button
          disabled={!isActive}
          type="primary"
          danger>
          Удалить
        </Button>
      </Popconfirm>
    </div>
  );
};
