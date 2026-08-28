export type ShopRole = "CUSTOMER" | "DISPATCH" | "OWNER"

export type ShopSession = {
  userId: string
  email: string
  isVip: boolean
  role?: ShopRole
}

export function assertCanCheckout(session: ShopSession | null): ShopSession {
  if (!session?.userId) {
    const err = new Error("Debes iniciar sesión para comprar")
    err.name = "CheckoutAuthError"
    throw err
  }
  return session
}

export function assertStaff(session: ShopSession | null, roles: ShopRole[]): ShopSession {
  const ok = assertCanCheckout(session)
  const role = ok.role ?? "CUSTOMER"
  if (!roles.includes(role)) {
    const err = new Error("No tenés acceso a este panel")
    err.name = "CheckoutAuthError"
    throw err
  }
  return { ...ok, role }
}

export function isCheckoutAuthError(err: unknown): boolean {
  return err instanceof Error && err.name === "CheckoutAuthError"
}
