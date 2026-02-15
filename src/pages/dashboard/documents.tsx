import { GetServerSidePropsContext, NextPage } from "next";
import { checkAuth } from "@/utils/checkAuth";
import React, { useEffect } from "react";
import { Layout } from "@/layouts/Layout";

import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Files } from "@/modules/Files";
import { useFilesStore } from "@/store/filesStore";
import styles from "@/styles/Home.module.scss";

interface Props {
  items: FileItem[];
}

const DashboardDocuments: NextPage<Props> = ({ items }) => {
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
          <h1>Документы</h1>
          <p className={styles.pageDescription}>
            PDF, Word, Excel и другие документы
          </p>
        </div>
        <Files
          items={items}
          withActions
          fileType="all"
          defaultFilter="document"
        />
      </div>
    </DashboardLayout>
  );
};

(DashboardDocuments as NextPage<Props> & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Документы - CloudDrive">{page}</Layout>;
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
    logger.error("Failed to fetch documents:", err);
    return {
      props: { items: [] },
    };
  }
};

export default DashboardDocuments;
