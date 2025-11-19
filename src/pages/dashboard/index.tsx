import { GetServerSidePropsContext, NextPage } from "next";

import { checkAuth } from "@/utils/checkAuth";
import React from "react";
import { Layout } from "@/layouts/layout";

import styles from "@/styles/Home.module.scss";
import { Button, Menu } from "antd";
import { useRouter } from "next/router";
import { DeleteOutlined, FileImageOutlined, FileOutlined } from "@ant-design/icons";

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const selectedMenu = router.pathname;

  return (
    <main className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <Button>Upload</Button>

        <Menu
          className={styles.menu}
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={[
            {
              key: "/dashboard",
              icon: <FileOutlined />,
              label: "Файлы",
              onClick: () => {
                router.push("/dashboard");
              },
            },
            {
              key: "/dashboard",
              icon: <FileImageOutlined />,
              label: "Фотографии",
              onClick: () => {
                router.push("/dashboard/photos");
              },
            },
            {
              key: "/dashboard",
              icon: <DeleteOutlined />,
              label: "Корзина",
              onClick: () => {
                router.push("/dashboard/trash");
              },
            },
          ]}
        />
      </div>

      <div className="container">
        <h1>Files</h1>
      </div>
    </main>
  );
};

(DashboardPage as NextPage & { getLayout?: (page: React.ReactNode) => React.ReactNode }).getLayout =
  (page: React.ReactNode) => {
    return <Layout title="Dashboard / Главная">{page}</Layout>;
  };

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  return {
    props: {},
  };
};

export default DashboardPage;
