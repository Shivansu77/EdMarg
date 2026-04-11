import type { NextConfig } from "next";
import path from "path";

const LEGACY_BACKEND_HOST = "https://edmarg-backend.vercel.app";
const LIVE_BACKEND_HOST = "https://edmarg-backend.vercel.app";

const remapBackendHost = (value?: string) => {
  if (!value) return undefined;
  return value.replace(LEGACY_BACKEND_HOST, LIVE_BACKEND_HOST);
};

const normalizedEnv = Object.fromEntries(
  Object.entries({
    NEXT_PUBLIC_API_URL: remapBackendHost(process.env.NEXT_PUBLIC_API_URL),
    NEXT_PUBLIC_API_BASE_URL: remapBackendHost(process.env.NEXT_PUBLIC_API_BASE_URL),
    NEXT_PUBLIC_BACKEND_URL: remapBackendHost(process.env.NEXT_PUBLIC_BACKEND_URL),
  }).filter(([, value]) => typeof value === "string")
) as Record<string, string>;

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
  },
  env: normalizedEnv,
};

export default nextConfig;
