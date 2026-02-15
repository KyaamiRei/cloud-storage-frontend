import styles from "@/components/Auth/Auth.module.scss";
import { Button, Form, Input, notification } from "antd";
import { LoginFormDTO } from "@/api/dto/auth.dto";

import * as Api from "@/api";
import { setCookie } from "nookies";
import { NotProps } from "@/api/dto/notification.dto";
import { logger } from "@/utils/logger";

export const LoginForm = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = ({ type, message, description }: NotProps) => {
    api[type]({
      message: message,
      description: description,
    });
  };

  const onSubmit = async (values: LoginFormDTO) => {
    try {
      const { token } = await Api.auth.login(values);

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
      logger.error("LoginForm error:", err);

      const errorMessage =
        err.response?.data?.message || "Неверный логин или пароль";

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
        name="login"
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
          label="Пароль"
          name="password"
          rules={[
            {
              required: true,
              message: "Укажите пароль",
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
            Войти
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
