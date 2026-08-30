import { defineConfig } from "vitest/config"
import { resolve } from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Better Auth opens one node:sqlite handle per test file; parallel files lock data/auth.test.sqlite.
    fileParallelism: false,
    env: {
      BETTER_AUTH_SECRET: "test-better-auth-secret-min-32-chars",
      BETTER_AUTH_URL: "http://shop.local",
      BETTER_AUTH_DB: "data/auth.test.sqlite",
      SESSION_SECRET: "test-session-secret-min-32-characters",
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
})
