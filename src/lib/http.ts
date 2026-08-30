import { cookies, headers } from "next/headers"
import { auth, ensureAuthSchema } from "./auth"
import type { ShopSession } from "./checkout-auth"
import { shopConfig } from "./config"
import { GUEST_COOKIE, guestCartId, guestCookie, newGuestId } from "./guest"
import { ensureShopUser, findUserByEmail, findUserById, loadDb, saveDb, type Db } from "./store"

export async function readSession(): Promise<ShopSession | null> {
  await ensureAuthSchema()
  const ba = await auth.api.getSession({ headers: await headers() })
  if (!ba?.user?.id || !ba.user.email) return null
  const shop = withDb((db) => findUserById(db, ba.user.id) ?? findUserByEmail(db, ba.user.email))
  const extra = ba.user as { role?: string; isVip?: boolean }
  const roleRaw = extra.role ?? shop?.role ?? "CUSTOMER"
  const role = roleRaw === "DISPATCH" || roleRaw === "OWNER" ? roleRaw : "CUSTOMER"
  return {
    userId: shop?.id ?? ba.user.id,
    email: ba.user.email,
    isVip: Boolean(extra.isVip ?? shop?.isVip),
    role: shop?.role === "DISPATCH" || shop?.role === "OWNER" ? shop.role : role,
  }
}

export async function syncSessionUser(input: {
  id: string
  email: string
  name: string
  isVip?: boolean
  role?: ShopSession["role"]
  profile?: Parameters<typeof ensureShopUser>[1]["profile"]
}): Promise<void> {
  withDb((db) =>
    ensureShopUser(db, {
      id: input.id,
      email: input.email,
      name: input.name,
      isVip: input.isVip,
      role: input.role,
      profile: input.profile,
    }),
  )
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
