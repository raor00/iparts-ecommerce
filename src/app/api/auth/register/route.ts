import { shopConfig } from "@/lib/config"
import { clearGuestCookie } from "@/lib/guest"
import { json, readGuestCartId, withDb } from "@/lib/http"
import { hashPassword } from "@/lib/password"
import { isProfileComplete, parseProfile } from "@/lib/profile"
import { absorbGuestCart, createUser, findUserByEmail } from "@/lib/store"
import { encodeSession, sessionCookie } from "@/lib/session"
import { isVipEmail } from "@/lib/vip-account"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; name?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""
  const profile = parseProfile(body)
  const name = body.name?.trim() || `${profile.firstName} ${profile.lastName}`.trim()
  if (!email.includes("@") || password.length < 8) {
    return json({ error: "Correo válido y contraseña de 8+ caracteres" }, 400)
  }
  if (!isProfileComplete(profile)) {
    return json({ error: "Completá país, nombre, cédula, teléfono y dirección de envío" }, 400)
  }
  try {
    const cfg = shopConfig()
    const guestCartId = await readGuestCartId()
    const user = withDb((db) => {
      if (findUserByEmail(db, email)) throw new Error("Ese correo ya está registrado")
      const created = createUser(db, {
        email,
        name,
        passwordHash: hashPassword(password),
        isVip: isVipEmail(email),
        profile,
      })
      if (guestCartId) absorbGuestCart(db, guestCartId, created.id)
      return created
    })
    const token = encodeSession(
      { userId: user.id, email: user.email, isVip: user.isVip, role: user.role },
      cfg.sessionSecret,
    )
    const cookies = [sessionCookie(token, cfg.secureCookies)]
    if (guestCartId) cookies.push(clearGuestCookie(cfg.secureCookies))
    return json(
      { id: user.id, email: user.email, name: user.name, isVip: user.isVip, role: user.role },
      201,
      undefined,
      cookies,
    )
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo registrar" }, 400)
  }
}
