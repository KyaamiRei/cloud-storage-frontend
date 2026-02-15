import React from "react";
import styles from "./FileActions.module.scss";
import { Button, Popconfirm } from "antd";

interface FileActionsProps {
  onClickRemove: VoidFunction;
  onClickDownload?: VoidFunction;
  isActive: boolean;
  isDownload?: boolean;
  isTrash?: boolean;
}

export const FileActions: React.FC<FileActionsProps> = ({
  onClickRemove,
  onClickDownload,
  isActive,
  isDownload,
  isTrash = false,
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
        description={isTrash ? "Файлы будут удалены навсегда. Это действие нельзя отменить." : "Все файлы будут перемещены в корзину"}
        okText="Да"
        cancelText="Нет"
        disabled={!isActive}
        onConfirm={onClickRemove}>
        <Button
          disabled={!isActive}
          type="primary"
          danger>
          {isTrash ? "Удалить навсегда" : "Удалить"}
        </Button>
      </Popconfirm>
    </div>
  );
};
