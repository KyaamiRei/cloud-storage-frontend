import { GetServerSidePropsContext, NextPage } from "next";

import { checkAuth } from "@/utils/checkAuth";

const DashboardPage: NextPage = () => {
  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const authProps = checkAuth(ctx);

  if ("redirect" in authProps) {
    return authProps;
  }

  return {
    props: {},
  };
};

export default DashboardPage;
