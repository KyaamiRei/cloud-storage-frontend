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

const DashboardArchives: NextPage<Props> = ({ items }) => {
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
          <h1>Архивы</h1>
          <p className={styles.pageDescription}>
            ZIP, RAR и другие архивы
          </p>
        </div>
        <Files
          items={items}
          withActions
          fileType="all"
          defaultFilter="archive"
        />
      </div>
    </DashboardLayout>
  );
};

(DashboardArchives as NextPage<Props> & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Архивы - CloudDrive">{page}</Layout>;
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
    console.log(err);
    return {
      props: { items: [] },
    };
  }
};

export default DashboardArchives;
