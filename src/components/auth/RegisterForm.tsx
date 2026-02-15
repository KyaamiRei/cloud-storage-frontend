import { RegisterFormDTO } from "@/api/dto/auth.dto";
import { NotProps } from "@/api/dto/notification.dto";
import { notification, Form, Input, Button } from "antd";
import { setCookie } from "nookies";
import React from "react";

import * as Api from "@/api";
import { logger } from "@/utils/logger";

import styles from "@/components/Auth/Auth.module.scss";

export const RegisterForm = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = ({ type, message, description }: NotProps) => {
    api[type]({
      message: message,
      description: description,
    });
  };

  const onSubmit = async (values: RegisterFormDTO) => {
    try {
      const { token } = await Api.auth.register(values);

      openNotificationWithIcon({
        type: "success",
        message: "Успешно",
        description: "Вы авторизированы",
      });

      setCookie(null, "_token", token, {
        path: "/",
      });

      location.href = "/dashboard";
    } catch (err: any) {
      logger.error("RegisterForm error:", err);

      const errorMessage =
        err.response?.data?.message || "Не удалось зарегистрироваться";

      openNotificationWithIcon({
        type: "error",
        message: "Ошибка",
        description: errorMessage,
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        name="register"
        layout="vertical"
        onFinish={onSubmit}
        autoComplete="off">
        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            {
              required: true,
              message: "Укажите почту",
            },
            {
              type: "email",
              message: "Введите корректный email",
            },
          ]}>
          <Input
            placeholder="example@mail.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Полное имя"
          name="fullName"
          rules={[
            {
              required: true,
              message: "Укажите полное имя",
            },
            {
              min: 2,
              message: "Имя должно содержать минимум 2 символа",
            },
          ]}>
          <Input
            placeholder="Иван Иванов"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[
            {
              required: true,
              message: "Укажите пароль",
            },
            {
              min: 6,
              message: "Пароль должен содержать минимум 6 символов",
            },
          ]}>
          <Input.Password
            placeholder="Введите пароль"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
