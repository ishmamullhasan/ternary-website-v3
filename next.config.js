import { withPayload } from "@payloadcms/next/withPayload";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
    ],
  },

  sassOptions: {
    includePaths: [
      path.resolve(process.cwd(), "node_modules"),
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@payload-config": path.resolve(process.cwd(), "./src/payload.config.ts"),
    };

    // 🔧 Fix pnpm + sass + payload
    config.resolve.symlinks = false;

    // Ignore Console Ninja
    if (config.externals) {
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, /console-ninja/]
        : [config.externals, /console-ninja/];
    } else {
      config.externals = [/console-ninja/];
    }

    return config;
  },
};

export default withPayload(nextConfig);