import { auth, cookiesFromHeaders, ensureAuthSchema } from "@/lib/auth"
import { shopConfig } from "@/lib/config"
import { clearGuestCookie } from "@/lib/guest"
import { json, readGuestCartId, withDb } from "@/lib/http"
import { isProfileComplete, parseProfile } from "@/lib/profile"
import { absorbGuestCart, ensureShopUser } from "@/lib/store"
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
    await ensureAuthSchema()
    const signed = await auth.api.signUpEmail({
      body: { email, password, name: name || email },
      headers: req.headers,
      returnHeaders: true,
    })
    const user = signed.response.user
    const guestCartId = await readGuestCartId()
    const shopUser = withDb((db) => {
      const created = ensureShopUser(db, {
        id: user.id,
        email: user.email,
        name: user.name || name,
        isVip: isVipEmail(user.email),
        profile,
      })
      if (guestCartId) absorbGuestCart(db, guestCartId, created.id)
      return created
    })
    const cookies = cookiesFromHeaders(signed.headers)
    if (guestCartId) cookies.push(clearGuestCookie(shopConfig().secureCookies))
    return json(
      {
        id: shopUser.id,
        email: shopUser.email,
        name: shopUser.name,
        isVip: shopUser.isVip,
        role: shopUser.role,
      },
      201,
      undefined,
      cookies,
    )
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo registrar" }, 400)
  }
}
