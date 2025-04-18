import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/productos",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/admin/productos",
       permanent: true,
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "8ec8whaldy.ufs.sh",

      },
      {
        hostname:"utfs.io"
      }
    ],
  },
  
};

export default nextConfig;
