import { GetServerSidePropsContext, NextPage } from "next";
import { checkAuth } from "@/utils/checkAuth";
import React, { useState, useEffect } from "react";
import { Layout } from "@/layouts/Layout";

import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Statistics } from "@/components/Statistics";
import styles from "@/styles/Home.module.scss";

interface Props {
  items: FileItem[];
  trashItems?: FileItem[];
  favoriteItems?: FileItem[];
}

const DashboardStatistics: NextPage<Props> = ({ items, trashItems = [], favoriteItems = [] }) => {
  const [allFiles, setAllFiles] = useState(items);
  const [trashFiles, setTrashFiles] = useState(trashItems);
  const [favoriteFiles, setFavoriteFiles] = useState(favoriteItems);

  useEffect(() => {
    // Загружаем дополнительные данные на клиенте
    const loadAdditionalData = async () => {
      try {
        const [trash, favorites] = await Promise.all([
          Api.files.getAll("trash").catch(() => []),
          Api.files.getAll("favorites").catch(() => []),
        ]);
        setTrashFiles(trash);
        setFavoriteFiles(favorites);
      } catch (error) {
        logger.error("Failed to load additional statistics:", error);
      }
    };
    loadAdditionalData();
  }, []);

  return (
    <DashboardLayout>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1>Статистика</h1>
          <p className={styles.pageDescription}>
            Аналитика ваших файлов и хранилища
          </p>
        </div>
        <Statistics 
          files={allFiles} 
          trashFiles={trashFiles}
          favoriteFiles={favoriteFiles}
        />
      </div>
    </DashboardLayout>
  );
};

(DashboardStatistics as NextPage<Props> & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Статистика - CloudDrive">{page}</Layout>;
  };

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = await checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  try {
    const [items, trashItems, favoriteItems] = await Promise.all([
      Api.files.getAll("all").catch(() => []),
      Api.files.getAll("trash").catch(() => []),
      Api.files.getAll("favorites").catch(() => []),
    ]);

    return {
      props: {
        items: items || [],
        trashItems: trashItems || [],
        favoriteItems: favoriteItems || [],
      },
    };
  } catch (err) {
    logger.error("Failed to fetch statistics:", err);
    return {
      props: { 
        items: [],
        trashItems: [],
        favoriteItems: [],
      },
    };
  }
};

export default DashboardStatistics;
