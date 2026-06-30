import type { NextConfig } from "next";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "30mb",
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.yandex.net",
        pathname: "/get-yapic/**",
        protocol: "https",
      },
    ],
  },
  async rewrites() {
    return [
      {
        destination: `${apiBaseUrl}/api/:path*`,
        source: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
