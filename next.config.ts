import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactStrictMode: true,
  experimental: {
    forceSwcTransforms: true, // ✅ Forces SWC even if Babel is present
  },
};

export default nextConfig;
