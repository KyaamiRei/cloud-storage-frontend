import { GetServerSidePropsContext, NextPage } from "next";
import { User } from "@/api/dto/auth.dto";
import { Button } from "antd";

import styles from "@/styles/Profile.module.scss";
import { checkAuth } from "@/utils/checkAuth";
import * as Api from "@/api";
import React from "react";
import { Layout } from "@/layouts/Layout";

interface Props {
  userData: User;
}

const DashboardProfilePage: NextPage<Props> = ({ userData }) => {
  const onClickLogout = () => {
    if (window.confirm("Вы действительно хотите выйти?")) {
      Api.auth.logout();
      location.href = "/";
    }
  };

  return (
    <main className={styles.root}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{userData.fullName.charAt(0).toUpperCase()}</div>
          <h1>Мой профиль</h1>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>ID пользователя</span>
            <span className={styles.value}>{userData.id}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Полное имя</span>
            <span className={styles.value}>{userData.fullName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>E-Mail</span>
            <span className={styles.value}>{userData.email}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={onClickLogout}
            type="primary"
            danger
            size="large">
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </main>
  );
};

(
  DashboardProfilePage as NextPage<Props> & {
    getLayout?: (page: React.ReactNode) => React.ReactNode;
  }
).getLayout = (page: React.ReactNode) => {
  return <Layout title="Dashboard / Профиль">{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = await checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  const userData = await Api.auth.getMe();

  return {
    props: {
      userData,
    },
  };
};

export default DashboardProfilePage;
