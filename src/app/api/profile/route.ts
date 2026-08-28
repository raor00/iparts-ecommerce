import { assertCanCheckout, isCheckoutAuthError } from "@/lib/checkout-auth"
import { json, readSession, withDb } from "@/lib/http"
import { isProfileComplete, parseProfile } from "@/lib/profile"
import { findUserById, updateUserProfile } from "@/lib/store"

export async function GET() {
  const session = await readSession()
  try {
    assertCanCheckout(session)
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const user = withDb((db) => findUserById(db, session!.userId))
  if (!user) return json({ error: "Usuario no encontrado" }, 404)
  return json({ profile: user.profile, complete: isProfileComplete(user.profile) })
}

export async function PATCH(req: Request) {
  const session = await readSession()
  try {
    assertCanCheckout(session)
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const profile = parseProfile(await req.json().catch(() => ({})))
  if (!isProfileComplete(profile)) {
    return json({ error: "Completá todos los campos de identidad y envío" }, 400)
  }
  const user = withDb((db) => updateUserProfile(db, session!.userId, profile))
  return json({ profile: user.profile, complete: true })
}
