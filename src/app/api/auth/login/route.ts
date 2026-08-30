import { auth, cookiesFromHeaders, ensureAuthSchema } from "@/lib/auth"
import { shopConfig } from "@/lib/config"
import { clearGuestCookie } from "@/lib/guest"
import { json, readGuestCartId, withDb } from "@/lib/http"
import { verifyPassword } from "@/lib/password"
import { absorbGuestCart, ensureShopUser, findUserByEmail } from "@/lib/store"

async function signInWithCookies(email: string, password: string, req: Request) {
  return auth.api.signInEmail({
    body: { email, password },
    headers: req.headers,
    returnHeaders: true,
  })
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = body.email?.trim().toLowerCase() ?? ""
  const password = body.password ?? ""
  const guestCartId = await readGuestCartId()

  try {
    await ensureAuthSchema()
    let signed: Awaited<ReturnType<typeof signInWithCookies>>
    try {
      signed = await signInWithCookies(email, password, req)
    } catch {
      const legacy = withDb((db) => findUserByEmail(db, email))
      if (!legacy || !legacy.passwordHash || !verifyPassword(password, legacy.passwordHash)) {
        return json({ error: "Correo o contraseña incorrectos" }, 401)
      }
      try {
        await auth.api.signUpEmail({
          body: { email, password, name: legacy.name },
          headers: req.headers,
        })
      } catch {
        /* already in Better Auth */
      }
      signed = await signInWithCookies(email, password, req)
      withDb((db) => ensureShopUser(db, { id: signed.response.user.id, email, name: legacy.name, isVip: legacy.isVip, role: legacy.role }))
    }

    const user = signed.response.user
    const shopUser = withDb((db) => {
      const ensured = ensureShopUser(db, {
        id: user.id,
        email: user.email,
        name: user.name || email,
        isVip: Boolean(user.isVip),
      })
      if (guestCartId) absorbGuestCart(db, guestCartId, ensured.id)
      return ensured
    })
    const cookies = cookiesFromHeaders(signed.headers)
    if (guestCartId) cookies.push(clearGuestCookie(shopConfig().secureCookies))
    return json(
      { id: shopUser.id, email: shopUser.email, name: shopUser.name, isVip: shopUser.isVip, role: shopUser.role },
      200,
      undefined,
      cookies,
    )
  } catch {
    return json({ error: "Correo o contraseña incorrectos" }, 401)
  }
}
