import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Anchor Turbopack to this app so starting it from the repository root
    // cannot produce mixed module IDs in the React Client Manifest.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
