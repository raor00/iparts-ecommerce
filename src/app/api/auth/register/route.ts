import { shopConfig } from "@/lib/config"
import { json, withDb } from "@/lib/http"
import { hashPassword } from "@/lib/password"
import { createUser, findUserByEmail } from "@/lib/store"
import { encodeSession, sessionCookie } from "@/lib/session"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; name?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""
  const name = body.name?.trim() ?? ""
  if (!email.includes("@") || password.length < 8) {
    return json({ error: "Correo válido y contraseña de 8+ caracteres" }, 400)
  }
  try {
    const cfg = shopConfig()
    const user = withDb((db) => {
      if (findUserByEmail(db, email)) throw new Error("Ese correo ya está registrado")
      return createUser(db, { email, name, passwordHash: hashPassword(password) })
    })
    const token = encodeSession({ userId: user.id, email: user.email, isVip: user.isVip }, cfg.sessionSecret)
    return json(
      { id: user.id, email: user.email, name: user.name, isVip: user.isVip },
      201,
      { "set-cookie": sessionCookie(token, cfg.secureCookies) },
    )
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo registrar" }, 400)
  }
}
