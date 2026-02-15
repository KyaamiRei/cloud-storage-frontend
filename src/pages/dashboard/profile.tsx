import { GetServerSidePropsContext, NextPage } from "next";
import { User } from "@/api/dto/auth.dto";
import { Button, Form, Input, Card, Divider, Space } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, EditOutlined, SaveOutlined, LogoutOutlined } from "@ant-design/icons";

import styles from "@/styles/Profile.module.scss";
import { checkAuth } from "@/utils/checkAuth";
import * as Api from "@/api";
import React, { useState } from "react";
import { Layout } from "@/layouts/Layout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import toast from "react-hot-toast";

interface Props {
  userData: User;
}

const DashboardProfilePage: NextPage<Props> = ({ userData: initialUserData }) => {
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onClickLogout = () => {
    if (window.confirm("Вы действительно хотите выйти?")) {
      Api.auth.logout();
      location.href = "/";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue({
      fullName: userData.fullName,
      email: userData.email,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: { fullName: string; email: string }) => {
    // Проверяем, изменились ли данные
    const hasChanges = 
      values.fullName !== userData.fullName || 
      values.email !== userData.email;

    if (!hasChanges) {
      setIsEditing(false);
      toast.success("Изменений не обнаружено");
      return;
    }

    setLoading(true);
    try {
      // Отправляем только измененные поля
      const updateData: { fullName?: string; email?: string } = {};
      
      if (values.fullName !== userData.fullName) {
        updateData.fullName = values.fullName;
      }
      
      if (values.email !== userData.email) {
        updateData.email = values.email;
      }

      const updatedUser = await Api.auth.updateProfile(updateData);
      setUserData(updatedUser);
      setIsEditing(false);
      toast.success("Профиль успешно обновлен");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Не удалось обновить профиль";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      await Api.auth.updateProfile({
        password: values.newPassword,
      });
      passwordForm.resetFields();
      setIsChangingPassword(false);
      toast.success("Пароль успешно изменен");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      toast.error(error.response?.data?.message || "Не удалось изменить пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <main className={styles.root}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>{userData.fullName.charAt(0).toUpperCase()}</div>
            <h1>Мой профиль</h1>
            <p className={styles.profileSubtitle}>Управление данными аккаунта</p>
          </div>

          <div className={styles.profileContent}>
            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Основная информация</h2>
                {!isEditing && (
                  <Button
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    type="text">
                    Редактировать
                  </Button>
                )}
              </div>

              {isEditing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  className={styles.profileForm}>
                  <Form.Item
                    label="Полное имя"
                    name="fullName"
                    rules={[
                      { required: true, message: "Введите полное имя" },
                      { min: 2, message: "Имя должно содержать минимум 2 символа" },
                    ]}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Введите полное имя"
                    />
                  </Form.Item>

                  <Form.Item
                    label="E-Mail"
                    name="email"
                    rules={[
                      { required: true, message: "Введите email" },
                      { type: "email", message: "Введите корректный email" },
                    ]}>
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Введите email"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}>
                        Сохранить
                      </Button>
                      <Button
                        onClick={handleCancel}>
                        Отмена
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
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
              )}
            </Card>

            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Безопасность</h2>
                {!isChangingPassword && (
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setIsChangingPassword(true)}
                    type="text">
                    Изменить пароль
                  </Button>
                )}
              </div>

              {isChangingPassword ? (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                  className={styles.profileForm}>
                  <Form.Item
                    label="Новый пароль"
                    name="newPassword"
                    rules={[
                      { required: true, message: "Введите новый пароль" },
                      { min: 6, message: "Пароль должен содержать минимум 6 символов" },
                    ]}>
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Введите новый пароль"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Подтвердите пароль"
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      { required: true, message: "Подтвердите пароль" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("newPassword") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error("Пароли не совпадают"));
                        },
                      }),
                    ]}>
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Подтвердите новый пароль"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}>
                        Сохранить пароль
                      </Button>
                      <Button
                        onClick={() => {
                          setIsChangingPassword(false);
                          passwordForm.resetFields();
                        }}>
                        Отмена
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Пароль</span>
                  <span className={styles.value}>••••••••</span>
                </div>
              )}
            </Card>

            <Divider />

            <div className={styles.actions}>
              <Button
                onClick={onClickLogout}
                type="primary"
                danger
                icon={<LogoutOutlined />}>
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
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
