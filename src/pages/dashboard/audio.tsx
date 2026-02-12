import { GetServerSidePropsContext, NextPage } from "next";
import { checkAuth } from "@/utils/checkAuth";
import React from "react";
import { Layout } from "@/layouts/Layout";

import * as Api from "@/api";
import { FileItem } from "@/api/dto/files.dto";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Files } from "@/modules/Files";
import styles from "@/styles/Home.module.scss";

interface Props {
  items: FileItem[];
}

const DashboardAudio: NextPage<Props> = ({ items }) => {
  return (
    <DashboardLayout>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1>Аудио</h1>
          <p className={styles.pageDescription}>
            Музыка и аудиофайлы
          </p>
        </div>
        <Files
          items={items}
          withActions
          defaultFilter="audio"
        />
      </div>
    </DashboardLayout>
  );
};

(DashboardAudio as NextPage<Props> & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Аудио - CloudDrive">{page}</Layout>;
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

export default DashboardAudio;
