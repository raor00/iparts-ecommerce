import { cookies } from "next/headers"
import { shopConfig } from "./config"
import { decodeSession, sessionCookieName } from "./session"
import { loadDb, saveDb, type Db } from "./store"
import type { ShopSession } from "./checkout-auth"

export async function readSession(): Promise<ShopSession | null> {
  const cfg = shopConfig()
  const jar = await cookies()
  return decodeSession(jar.get(sessionCookieName())?.value, cfg.sessionSecret)
}

export function withDb<T>(fn: (db: Db) => T): T {
  const path = shopConfig().dataPath
  const db = loadDb(path)
  const result = fn(db)
  saveDb(path, db)
  return result
}

export function json(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  })
}
