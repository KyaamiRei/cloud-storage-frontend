import { GetServerSidePropsContext, NextPage } from "next";

import { checkAuth } from "@/utils/checkAuth";
import React, { useEffect } from "react";

import * as Api from "@/api";
import { useFilesStore } from "@/store/filesStore";
import { logger } from "@/utils/logger";

import { Layout } from "@/layouts/Layout";
import { FileItem } from "@/api/dto/files.dto";
import { Files } from "@/modules/Files";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import styles from "@/styles/Home.module.scss";

interface Props {
  items: FileItem[];
}

const DashboardPage: NextPage<Props> = ({ items }) => {
  const { setFiles } = useFilesStore();

  // Инициализируем store при загрузке страницы
  useEffect(() => {
    if (items && items.length > 0) {
      setFiles(items);
    }
  }, [items, setFiles]);

  return (
    <DashboardLayout>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1>Мои файлы</h1>
          <p className={styles.pageDescription}>
            Все ваши файлы в одном месте
          </p>
        </div>
        <Files
          items={items}
          withActions
          fileType="all"
        />
      </div>
    </DashboardLayout>
  );
};

(DashboardPage as NextPage & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Мои файлы - CloudDrive">{page}</Layout>;
  };

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = await checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  try {
    const items = await Api.files.getAll();

    return {
      props: {
        items,
      },
    };
  } catch (err) {
    logger.error("Failed to fetch files:", err);
    return {
      props: { items: [] },
    };
  }
};

export default DashboardPage;
