import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true,
},
images:{
  remotePatterns: [
    {
     
      hostname: "8ec8whaldy.ufs.sh",
     
    },
   
  ],
}
};

export default nextConfig;
