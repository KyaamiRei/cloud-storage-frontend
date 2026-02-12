import { Header } from "@/components/Header";
import Head from "next/head";
import React from "react";

interface LayoutProps {
  title: string;
}

export const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main>
        <Header />
        {children}
      </main>
    </>
  );
};
