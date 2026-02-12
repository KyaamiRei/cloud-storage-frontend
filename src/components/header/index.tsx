import { Avatar, Button, Input, Layout, Menu, Popover, Space } from "antd";
import React, { useState } from "react";
import * as Api from "@/api";
import {
  CloudOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";

import styles from "./Header.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";

export const Header: React.FC = () => {
  const router = useRouter();
  const selectedMenu = router.pathname;
  const [searchValue, setSearchValue] = useState("");

  const onClickLogout = () => {
    if (window.confirm("Вы действительно хотите выйти?")) {
      Api.auth.logout();
      location.href = "/";
    }
  };

  const onSearch = (value: string) => {
    // TODO: Implement search functionality
    console.log("Search:", value);
  };

  return (
    <Layout.Header className={styles.root}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <Link href={"/dashboard"}>
            <div className={styles.logo}>
              <CloudOutlined className={styles.logoIcon} />
              <span className={styles.logoText}>CloudDrive</span>
            </div>
          </Link>
        </div>

        <div className={styles.headerRight}>
          <Space size="middle">
            <Popover
              trigger="click"
              placement="bottomRight"
              content={
                <div className={styles.userMenu}>
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    block
                    className={styles.menuItem}
                    onClick={() => router.push("/dashboard/profile")}>
                    Профиль
                  </Button>

                  <div className={styles.menuDivider} />
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    danger
                    block
                    className={styles.menuItem}
                    onClick={onClickLogout}>
                    Выйти
                  </Button>
                </div>
              }>
              <Avatar
                className={styles.avatar}
                icon={<UserOutlined />}
              />
            </Popover>
          </Space>
        </div>
      </div>
    </Layout.Header>
  );
};
