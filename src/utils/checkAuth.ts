import axios from "@/core/axios";
import { GetServerSidePropsContext } from "next";
import nookies from "nookies";

import * as Api from "@/api";

export const checkAuth = async (ctx: GetServerSidePropsContext) => {
  const { _token } = nookies.get(ctx);

  axios.defaults.headers.Authorization = "Bearer " + _token;

  try {
    await Api.auth.getMe();

    return {
      props: {},
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/dashboard/auth",
        permanent: false,
      },
    };
  }
};
