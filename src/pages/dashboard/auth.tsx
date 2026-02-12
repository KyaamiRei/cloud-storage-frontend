import { LoginForm } from "@/components/Auth/LoginForm";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { Tabs } from "antd";
import { NextPage } from "next";
import Head from "next/head";
import styles from "@/components/Auth/Auth.module.scss";

const AuthPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Авторизация | CloudStorage</title>
      </Head>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "20px",
        }}>
        <div className={styles.formBlock}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#1a1a1a",
                margin: "0 0 8px 0",
                letterSpacing: "-0.5px",
              }}>
              CloudStorage
            </h1>
            <p style={{ color: "#718096", fontSize: "15px", margin: 0 }}>
              Добро пожаловать обратно
            </p>
          </div>
          <Tabs
            items={[
              {
                label: "Войти",
                key: "1",
                children: <LoginForm />,
              },
              {
                label: "Регистрация",
                key: "2",
                children: <RegisterForm />,
              },
            ]}
          />
        </div>
      </main>
    </>
  );
};

export default AuthPage;
