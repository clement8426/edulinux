import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external packages in server components (node-pty lives in server.js, not here)
  transpilePackages: ['@xterm/xterm', '@xterm/addon-fit'],
};

export default nextConfig;
