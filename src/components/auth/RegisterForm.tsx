import { RegisterFormDTO } from "@/api/dto/auth.dto";
import { NotProps } from "@/api/dto/notification.dto";
import { notification, Form, Input, Button } from "antd";
import { setCookie } from "nookies";
import React from "react";

import * as Api from "@/api";

import styles from "@/components/auth/Auth.module.scss";

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
    } catch (err) {
      console.warn(err);

      openNotificationWithIcon({
        type: "error",
        message: "Ошибка",
        description: "Неверный логин или пороль",
      });
    }
  };

  return (
    <div className={styles.root}>
      {contextHolder}
      <Form
        name="basik"
        labelCol={{ span: 8 }}
        onFinish={onSubmit}>
        <Form.Item
          label="E-mail"
          name="email"
          rules={[
            {
              required: true,
              message: "Укажиите почту",
            },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Полное имя"
          name="fullName"
          rules={[
            {
              required: true,
              message: "Укажите полное имя",
            },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Укажиите пороль",
            },
          ]}>
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}>
          <Button
            type="primary"
            htmlType="submit">
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
