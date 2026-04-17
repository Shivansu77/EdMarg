import type { NextConfig } from "next";
import path from "path";

const LEGACY_BACKEND_HOST = "https://edmarg-backend.vercel.app";
const LIVE_BACKEND_HOST = "https://edmarg-backend.vercel.app";
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

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
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "edmarg-backend.vercel.app",
      },
      {
        protocol: "https",
        hostname: "edmarg.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  env: normalizedEnv,
};

export default nextConfig;
