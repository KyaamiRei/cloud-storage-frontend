import { Avatar, Button, Input, Layout, Menu, Popover, Space } from "antd";
import React, { useState } from "react";
import * as Api from "@/api";
import { logger } from "@/utils/logger";
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
  const [popoverVisible, setPopoverVisible] = useState(false);

  const onClickLogout = () => {
    setPopoverVisible(false);
    if (window.confirm("Вы действительно хотите выйти?")) {
      Api.auth.logout();
      location.href = "/";
    }
  };

  const handleProfileClick = () => {
    setPopoverVisible(false);
    router.push("/dashboard/profile");
  };

  const onSearch = (value: string) => {
    // TODO: Implement search functionality
    logger.log("Search:", value);
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
              open={popoverVisible}
              onOpenChange={setPopoverVisible}
              overlayClassName={styles.popoverOverlay}
              content={
                <div className={styles.userMenu}>
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    block
                    className={styles.menuItem}
                    onClick={handleProfileClick}>
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
                style={{ cursor: "pointer" }}
              />
            </Popover>
          </Space>
        </div>
      </div>
    </Layout.Header>
  );
};
