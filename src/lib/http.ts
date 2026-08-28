import { cookies } from "next/headers"
import { shopConfig } from "./config"
import { GUEST_COOKIE, guestCartId, guestCookie, newGuestId } from "./guest"
import { decodeSession, sessionCookieName } from "./session"
import { loadDb, saveDb, type Db } from "./store"
import type { ShopSession } from "./checkout-auth"

export async function readSession(): Promise<ShopSession | null> {
  const cfg = shopConfig()
  const jar = await cookies()
  return decodeSession(jar.get(sessionCookieName())?.value, cfg.sessionSecret)
}

export async function resolveCartActor(): Promise<{
  cartId: string | null
  isVip: boolean
  session: ShopSession | null
}> {
  const session = await readSession()
  if (session) return { cartId: session.userId, isVip: session.isVip, session }
  const jar = await cookies()
  const existing = jar.get(GUEST_COOKIE)?.value
  if (existing) return { cartId: guestCartId(existing), isVip: false, session: null }
  return { cartId: null, isVip: false, session: null }
}

export function createGuestActor(): { cartId: string; guestSetCookie: string } {
  const cfg = shopConfig()
  const id = newGuestId()
  return { cartId: guestCartId(id), guestSetCookie: guestCookie(id, cfg.secureCookies) }
}

export async function readGuestCartId(): Promise<string | null> {
  const jar = await cookies()
  const id = jar.get(GUEST_COOKIE)?.value
  return id ? guestCartId(id) : null
}

export function withDb<T>(fn: (db: Db) => T): T {
  const path = shopConfig().dataPath
  const db = loadDb(path)
  const result = fn(db)
  saveDb(path, db)
  return result
}

export function json(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
  extraCookies: string[] = [],
): Response {
  const headers = new Headers({ "content-type": "application/json" })
  for (const [key, value] of Object.entries(extraHeaders ?? {})) {
    if (key.toLowerCase() === "set-cookie") headers.append("set-cookie", value)
    else headers.set(key, value)
  }
  for (const cookie of extraCookies) headers.append("set-cookie", cookie)
  return new Response(JSON.stringify(data), { status, headers })
}
