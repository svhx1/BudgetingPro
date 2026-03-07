import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" }, // Previne Clickjacking
          { key: "X-Content-Type-Options", value: "nosniff" }, // Previne MIME Sniffing
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" } // Força HTTPS
        ],
      },
    ];
  },
};

export default nextConfig;
