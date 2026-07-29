import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
    ],
    // Payload (and S3) media URLs use query strings (?prefix=…, cache tags, etc.).
    // Omit `search` so any query string is allowed for this path.
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      // Static art shipped in /public (the hero structure). Without an entry here next/image
      // rejects the src outright and the page 500s — this allowlist is deny-by-default.
      {
        pathname: '/images/**',
      },
    ],
  },

  sassOptions: {
    includePaths: [path.resolve(process.cwd(), 'node_modules')],
  },

  // Case-study detail moved /stories/<slug> → /case-studies/<slug> (the /stories index is
  // unchanged). next.config redirects run before the locale middleware, so match the unprefixed
  // (en) and /bn forms explicitly. `:slug` requires exactly one segment, so the bare /stories
  // index is never matched.
  async redirects() {
    return [
      { source: '/stories/:slug', destination: '/case-studies/:slug', permanent: true },
      { source: '/bn/stories/:slug', destination: '/bn/case-studies/:slug', permanent: true },
    ]
  },

  // Baseline security headers. A tuned Content-Security-Policy is a deliberate follow-up
  // (needs per-app allowlisting for the Payload admin + Next runtime).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@payload-config': path.resolve(process.cwd(), './src/payload.config.ts'),
    }

    // 🔧 Fix pnpm + sass + payload
    config.resolve.symlinks = false

    // Ignore Console Ninja
    if (config.externals) {
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, /console-ninja/]
        : [config.externals, /console-ninja/]
    } else {
      config.externals = [/console-ninja/]
    }

    return config
  },
}

export default withPayload(nextConfig)
