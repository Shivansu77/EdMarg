import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  turbopack: {
    // We set root to __dirname instead of .. because the frontend has its own node_modules
    // and setting it to .. broke tailwindcss resolution.
    root: __dirname,
  },
};

export default nextConfig;
