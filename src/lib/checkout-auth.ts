export type ShopSession = {
  userId: string
  email: string
  isVip: boolean
}

export function assertCanCheckout(session: ShopSession | null): ShopSession {
  if (!session?.userId) {
    const err = new Error("Debes iniciar sesión para comprar")
    err.name = "CheckoutAuthError"
    throw err
  }
  return session
}

export function isCheckoutAuthError(err: unknown): boolean {
  return err instanceof Error && err.name === "CheckoutAuthError"
}
