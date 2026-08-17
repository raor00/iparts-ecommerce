import { createHmac, timingSafeEqual } from "node:crypto"
import type { ShopSession } from "./checkout-auth"

const COOKIE = "iparts_shop_session"

export function sessionCookieName(): string {
  return COOKIE
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

export function encodeSession(session: ShopSession, secret: string): string {
  if (!secret) throw new Error("SESSION_SECRET is not configured")
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url")
  return `${payload}.${sign(payload, secret)}`
}

export function decodeSession(token: string | undefined, secret: string): ShopSession | null {
  if (!token || !secret) return null
  const dot = token.lastIndexOf(".")
  if (dot < 1) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(payload, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ShopSession
    if (!parsed.userId || !parsed.email) return null
    return { userId: parsed.userId, email: parsed.email, isVip: Boolean(parsed.isVip) }
  } catch {
    return null
  }
}

export function sessionCookie(token: string, secure: boolean): string {
  const parts = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=2592000",
  ]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function clearSessionCookie(secure: boolean): string {
  const parts = [`${COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}
