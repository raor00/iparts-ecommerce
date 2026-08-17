import { shopConfig } from "@/lib/config"
import { json, withDb } from "@/lib/http"
import { verifyPassword } from "@/lib/password"
import { findUserByEmail } from "@/lib/store"
import { encodeSession, sessionCookie } from "@/lib/session"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const user = withDb((db) => findUserByEmail(db, email))
  if (!user || !verifyPassword(body.password ?? "", user.passwordHash)) {
    return json({ error: "Correo o contraseña incorrectos" }, 401)
  }
  const cfg = shopConfig()
  const token = encodeSession({ userId: user.id, email: user.email, isVip: user.isVip }, cfg.sessionSecret)
  return json(
    { id: user.id, email: user.email, name: user.name, isVip: user.isVip },
    200,
    { "set-cookie": sessionCookie(token, cfg.secureCookies) },
  )
}
