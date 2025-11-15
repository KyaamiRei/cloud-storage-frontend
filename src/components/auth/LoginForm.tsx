import styles from "@/components/auth/Auth.module.scss";
import { Button, Form, Input, notification } from "antd";
import { LoginFormDTO } from "@/api/dto/auth.dto";

import * as Api from "@/api";
import { setCookie } from "nookies";
import { NotProps } from "@/api/dto/notification.dto";

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
    } catch (err) {
      console.warn("LoginForm", err);

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
            Войти
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
