import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from GitHub and our CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
  // Shiki must be treated as external on the server (ESM)
  serverExternalPackages: ["shiki"],
};

export default nextConfig;
