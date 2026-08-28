import { shopConfig } from "@/lib/config"
import { clearGuestCookie } from "@/lib/guest"
import { json, readGuestCartId, withDb } from "@/lib/http"
import { verifyPassword } from "@/lib/password"
import { absorbGuestCart, findUserByEmail } from "@/lib/store"
import { encodeSession, sessionCookie } from "@/lib/session"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const guestCartId = await readGuestCartId()
  const user = withDb((db) => {
    const found = findUserByEmail(db, email)
    return found
  })
  if (!user || !verifyPassword(body.password ?? "", user.passwordHash)) {
    return json({ error: "Correo o contraseña incorrectos" }, 401)
  }
  if (guestCartId) {
    withDb((db) => absorbGuestCart(db, guestCartId, user.id))
  }
  const cfg = shopConfig()
  const token = encodeSession(
    { userId: user.id, email: user.email, isVip: user.isVip, role: user.role ?? "CUSTOMER" },
    cfg.sessionSecret,
  )
  const cookies = [sessionCookie(token, cfg.secureCookies)]
  if (guestCartId) cookies.push(clearGuestCookie(cfg.secureCookies))
  return json({ id: user.id, email: user.email, name: user.name, isVip: user.isVip }, 200, undefined, cookies)
}
