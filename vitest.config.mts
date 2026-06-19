import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // The admin SSO plugin (WEB-448) pulls next-auth into the payload.config import chain. next-auth's
    // env.js does `import ... from "next/server"`, which Vite's resolver only maps correctly when the
    // package is inlined (transformed) rather than externalized — otherwise it fails with
    // "Cannot find module .../next/server ... Did you mean next/server.js?".
    server: {
      deps: {
        inline: ['next-auth', '@auth/core', 'payload-authjs'],
      },
    },
  },
})
