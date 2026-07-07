import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnvFile } from "dotenv";
import type { NextConfig } from "next";

const rootFrontendEnv = path.join(__dirname, "..", ".env.frontend.local");

if (existsSync(rootFrontendEnv)) {
  loadEnvFile({ path: rootFrontendEnv });
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@invite/shared"],
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
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, ".."),
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
