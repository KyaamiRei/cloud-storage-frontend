import { GetServerSidePropsContext, NextPage } from "next";
import { checkAuth } from "@/utils/checkAuth";
import React, { useEffect } from "react";
import { Layout } from "@/layouts/Layout";

import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Files } from "@/modules/Files";
import { FileSelectType } from "@/components/FileList";
import { useFilesStore } from "@/store/filesStore";
import { useUIStore } from "@/store/uiStore";
import toast from "react-hot-toast";
import { logger } from "@/utils/logger";

interface Props {
  items: FileItem[];
  withActions?: boolean;
}

const DashboardTrash: NextPage<Props> = ({ items, withActions }) => {
  const { setFiles, getFilesByType } = useFilesStore();
  const { selectedFileIds, selectFile, deselectFile, deselectAll } = useUIStore();

  // Обновляем файлы при изменении items
  useEffect(() => {
    if (items && items.length > 0) {
      setFiles(items);
    }
  }, [items, setFiles]);

  const files = getFilesByType("trash");

  const onClickRemove = async () => {
    if (selectedFileIds.length === 0) return;

    const idsToRemove = [...selectedFileIds];
    logger.log("Removing files with IDs:", idsToRemove);

    try {
      await Api.files.removePermanently(idsToRemove);
      logger.log("Files removed permanently");
      
      // Обновляем список файлов с сервера
      try {
        const updatedFiles = await Api.files.getAll("trash");
        logger.log("Updated files from server:", updatedFiles.length);
        setFiles(updatedFiles);
      } catch (error) {
        logger.error("Failed to refresh files:", error);
      }
      
      const removedCount = idsToRemove.length;
      deselectAll();
      toast.success(`Удалено файлов: ${removedCount}`);
    } catch (error: any) {
      logger.error("Failed to remove files:", error);
      logger.error("Error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Не удалось удалить файлы");
    }
  };

  const onClickRestore = async () => {
    if (selectedFileIds.length === 0) return;

    const idsToRestore = [...selectedFileIds];
    logger.log("Restoring files with IDs:", idsToRestore);

    try {
      await Api.files.restore(idsToRestore);
      logger.log("Files restored");
      
      // Обновляем список файлов с сервера
      try {
        const updatedFiles = await Api.files.getAll("trash");
        logger.log("Updated files from server:", updatedFiles.length);
        setFiles(updatedFiles);
      } catch (error) {
        logger.error("Failed to refresh files:", error);
      }
      
      const restoredCount = idsToRestore.length;
      deselectAll();
      toast.success(`Восстановлено файлов: ${restoredCount}`);
    } catch (error: any) {
      logger.error("Failed to restore files:", error);
      logger.error("Error details:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Не удалось восстановить файлы");
    }
  };

  const handleFileSelect = (id: number, type: FileSelectType) => {
    if (type === "select") {
      selectFile(id);
    } else {
      deselectFile(id);
    }
  };

  return (
    <DashboardLayout>
      <Files
        items={files}
        withActions
        onFileSelect={handleFileSelect}
        selectedIds={selectedFileIds}
        fileType="trash"
        onDelete={onClickRemove}
        onRestore={onClickRestore}
        deleteTitle="Удалить файл(ы)?"
        deleteDescription="Файлы будут удалены навсегда. Это действие нельзя отменить."
        deleteButtonText="Удалить навсегда"
        hideDownload={true}
        hideShare={true}
      />
    </DashboardLayout>
  );
};

(
  DashboardTrash as typeof DashboardTrash & {
    getLayout?: (page: React.ReactNode) => React.ReactNode;
  }
).getLayout = (page: React.ReactNode) => {
  return <Layout title="Dashboard / Корзина">{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = await checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  try {
    const items = await Api.files.getAll("trash");

    return {
      props: {
        items,
      },
    };
  } catch (err) {
    logger.error("Failed to fetch trash files:", err);
    return {
      props: { items: [] },
    };
  }
};

export default DashboardTrash;
