import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'arweave.net' },
    ],
  },
  // Silence the multi-lockfile workspace-root warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
