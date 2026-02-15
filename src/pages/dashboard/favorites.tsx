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

interface Props {
  items: FileItem[];
}

const DashboardFavorites: NextPage<Props> = ({ items }) => {
  const { setFiles, getFilesByType, updateFile } = useFilesStore();
  const { selectedFileIds, selectFile, deselectFile, deselectAll } = useUIStore();

  // Обновляем файлы при изменении items
  useEffect(() => {
    if (items && items.length > 0) {
      setFiles(items);
    }
  }, [items, setFiles]);

  const files = getFilesByType("favorites");

  const handleFileSelect = (id: number, type: FileSelectType) => {
    if (type === "select") {
      selectFile(id);
    } else {
      deselectFile(id);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const updatedFile = await Api.files.toggleFavorite(id);
      // Обновляем файл в store
      updateFile(id, { isFavorite: updatedFile.isFavorite });
      // Если файл убран из избранного, снимаем выделение
      if (!updatedFile.isFavorite) {
        deselectFile(id);
      }
      toast.success(updatedFile.isFavorite ? "Добавлено в избранное" : "Удалено из избранного");
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Не удалось изменить статус избранного");
    }
  };

  return (
    <DashboardLayout>
      <Files
        items={files}
        withActions
        onFileSelect={handleFileSelect}
        selectedIds={selectedFileIds}
        fileType="favorites"
        onToggleFavorite={handleToggleFavorite}
      />
    </DashboardLayout>
  );
};

(
  DashboardFavorites as typeof DashboardFavorites & {
    getLayout?: (page: React.ReactNode) => React.ReactNode;
  }
).getLayout = (page: React.ReactNode) => {
  return <Layout title="Dashboard / Избранное">{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = await checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  try {
    const items = await Api.files.getAll("favorites");

    return {
      props: {
        items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: { items: [] },
    };
  }
};

export default DashboardFavorites;
