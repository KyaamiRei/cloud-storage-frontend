import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "7777",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
