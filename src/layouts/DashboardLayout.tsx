import React from "react";
import styles from "@/styles/Home.module.scss";
import { useRouter } from "next/router";
import { UploadButton } from "@/components/UploadButton";
import { Menu, Divider } from "antd";
import {
  DeleteOutlined,
  FileImageOutlined,
  FileOutlined,
  StarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  FileZipOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const selectedMenu = router.pathname;

  return (
    <main className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <UploadButton />
        </div>

        <Divider className={styles.divider} />

        <Menu
          className={styles.menu}
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={[
            {
              key: `/dashboard`,
              icon: <FileOutlined />,
              label: `Мои файлы`,
              onClick: () => router.push("/dashboard"),
            },
            {
              key: `/dashboard/photos`,
              icon: <FileImageOutlined />,
              label: `Фото`,
              onClick: () => router.push("/dashboard/photos"),
            },
            {
              key: `/dashboard/documents`,
              icon: <FileTextOutlined />,
              label: `Документы`,
              onClick: () => router.push("/dashboard/documents"),
            },
            {
              key: `/dashboard/videos`,
              icon: <PlayCircleOutlined />,
              label: `Видео`,
              onClick: () => router.push("/dashboard/videos"),
            },
            {
              key: `/dashboard/audio`,
              icon: <SoundOutlined />,
              label: `Аудио`,
              onClick: () => router.push("/dashboard/audio"),
            },
            {
              key: `/dashboard/archives`,
              icon: <FileZipOutlined />,
              label: `Архивы`,
              onClick: () => router.push("/dashboard/archives"),
            },
            {
              type: "divider",
            },
            {
              key: `/dashboard/statistics`,
              icon: <BarChartOutlined />,
              label: `Статистика`,
              onClick: () => router.push("/dashboard/statistics"),
            },
            {
              key: "starred",
              icon: <StarOutlined />,
              label: `Избранное`,
              onClick: () => {
                // TODO: Implement starred files
                console.log("Starred files");
              },
            },
            {
              key: "recent",
              icon: <ClockCircleOutlined />,
              label: `Недавние`,
              onClick: () => {
                // TODO: Implement recent files
                console.log("Recent files");
              },
            },
            {
              type: "divider",
            },
            {
              key: `/dashboard/trash`,
              icon: <DeleteOutlined />,
              label: `Корзина`,
              onClick: () => router.push("/dashboard/trash"),
            },
          ]}
        />
      </div>

      <div className={styles.content}>{children}</div>
    </main>
  );
};
