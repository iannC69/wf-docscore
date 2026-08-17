import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the Next.js dev indicator / watermark completely
  devIndicators: false,

  // Allow images from GitHub and CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "*.githubusercontent.com" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
    ],
  },
  // Shiki must be treated as external on the server (ESM)
  serverExternalPackages: ["shiki"],

  // OWASP Recommended HTTP Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
