export type PaymentRequest = {
  amount: string
  token: string
}

export type PaymentResult =
  | { ok: true; reference: string }
  | { ok: false; error: string }

/** Plug-in payment hook. A non-empty token authorizes the exact amount. */
export function processPayment(req: PaymentRequest): PaymentResult {
  const amount = Number(req.amount)
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Monto inválido" }
  if (!req.token.trim()) return { ok: false, error: "Falta el token de pago" }
  return { ok: true, reference: `pay_${Buffer.from(`${req.token}:${req.amount}`).toString("base64url").slice(0, 16)}` }
}
