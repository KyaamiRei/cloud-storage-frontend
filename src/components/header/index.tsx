import { Avatar, Button, Layout, Menu, Popover } from "antd";
import React from "react";
import * as Api from "@/api";
import { CloudOutlined } from "@ant-design/icons";

import styles from "./Header.module.scss";
import { useRouter } from "next/router";

export const Header: React.FC = () => {
  const router = useRouter();
  const selectedMenu = router.pathname;

  const onClickLogout = () => {
    if (window.confirm("Вы действительно хотите выйти?")) {
      Api.auth.logout();
      location.href = "/";
    }
  };
  return (
    <Layout.Header className={styles.root}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <h2>
            <CloudOutlined />
            CloudStorage
          </h2>

          <Menu
            className={styles.topMenu}
            defaultSelectedKeys={[selectedMenu]}
            onSelect={({ key }) => {
              router.push(key);
            }}
            theme="dark"
            mode="horizontal"
            items={[
              { key: "/dashboard", label: "Главная" },
              {
                key: "/dashboard/profile",
                label: "Профиль",
              },
            ]}
          />
        </div>

        <div className={styles.headerRight}>
          <Popover
            trigger="click"
            content={
              <Button
                onClick={onClickLogout}
                type="primary"
                danger>
                Выйти
              </Button>
            }>
            <Avatar>A</Avatar>
          </Popover>
        </div>
      </div>
    </Layout.Header>
  );
};
