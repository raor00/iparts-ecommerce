import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { betterAuth } from "better-auth"
import { getMigrations } from "better-auth/db/migration"
import { nextCookies } from "better-auth/next-js"
import { isVipEmail } from "./vip-account"

function sqlitePath(): string {
  return process.env.BETTER_AUTH_DB ?? join(process.cwd(), "data", "auth.sqlite")
}

function openAuthDb(): DatabaseSync {
  const path = sqlitePath()
  mkdirSync(dirname(path), { recursive: true })
  return new DatabaseSync(path)
}

const secret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.SESSION_SECRET ||
  "dev-better-auth-secret-min-32-chars!!"

export const auth = betterAuth({
  secret,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3100",
  database: openAuthDb(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER", input: false },
      isVip: { type: "boolean", defaultValue: false, input: false },
    },
  },
  advanced: {
    cookiePrefix: "iparts",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: [
    "http://localhost:3100",
    "http://localhost:3101",
    "http://127.0.0.1:3100",
    "http://127.0.0.1:3101",
    "http://shop.local",
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: "CUSTOMER",
            isVip: isVipEmail(user.email),
          },
        }),
      },
    },
  },
  plugins: [nextCookies()],
})

export function cookiesFromHeaders(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie()
  const single = headers.get("set-cookie")
  return single ? [single] : []
}

export function sessionCookieIsHttpOnly(setCookie: string): boolean {
  return /httponly/i.test(setCookie)
}

let migrated = false

export async function ensureAuthSchema(): Promise<void> {
  if (migrated) return
  const { runMigrations } = await getMigrations(auth.options)
  await runMigrations()
  migrated = true
}
