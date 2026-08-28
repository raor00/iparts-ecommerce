import { randomUUID } from "node:crypto"

export const GUEST_COOKIE = "iparts_shop_guest"

export function guestCartId(guestId: string): string {
  return `guest:${guestId}`
}

export function guestCookie(id: string, secure: boolean): string {
  const parts = [`${GUEST_COOKIE}=${id}`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=2592000"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function clearGuestCookie(secure: boolean): string {
  const parts = [`${GUEST_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function newGuestId(): string {
  return randomUUID()
}
