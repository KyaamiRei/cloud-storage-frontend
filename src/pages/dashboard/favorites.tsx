import { GetServerSidePropsContext, NextPage } from "next";
import { checkAuth } from "@/utils/checkAuth";
import React from "react";
import { Layout } from "@/layouts/Layout";

import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Files } from "@/modules/Files";
import { FileSelectType } from "@/components/FileList";
import toast from "react-hot-toast";

interface Props {
  items: FileItem[];
}

const DashboardFavorites: NextPage<Props> = ({ items }) => {
  const [files, setFiles] = React.useState(items || []);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  // Обновляем файлы при изменении items
  React.useEffect(() => {
    setFiles(items || []);
  }, [items]);

  const handleFileSelect = (id: number, type: FileSelectType) => {
    if (type === "select") {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((_id) => _id !== id));
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const updatedFile = await Api.files.toggleFavorite(id);
      // Обновляем файл в списке
      setFiles((prev) =>
        prev.map((file) => (file.id === id ? { ...file, isFavorite: updatedFile.isFavorite } : file))
      );
      // Если файл убран из избранного, удаляем его из списка
      if (!updatedFile.isFavorite) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
        setSelectedIds((prev) => prev.filter((_id) => _id !== id));
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
        selectedIds={selectedIds}
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
