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

function authSecret(): string {
  const configured = process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET
  if (configured) return configured
  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production")
  }
  return "dev-better-auth-secret-min-32-chars!!"
}

const secret = authSecret()

const appOrigin = process.env.BETTER_AUTH_URL?.trim()

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
    ...(appOrigin ? [appOrigin] : []),
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
let migrating: Promise<void> | null = null

export async function ensureAuthSchema(): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") return
  if (migrated) return
  if (!migrating) {
    migrating = (async () => {
      const { runMigrations } = await getMigrations(auth.options)
      try {
        await runMigrations()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!/already exists/i.test(msg)) throw err
      }
      migrated = true
    })()
  }
  await migrating
}
