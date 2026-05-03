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
    // Payload (and S3) media URLs use query strings (?prefix=…, cache tags, etc.).
    // Omit `search` so any query string is allowed for this path.
    localPatterns: [
      {
        pathname: "/api/media/file/**",
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