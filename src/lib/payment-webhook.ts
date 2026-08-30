import { createHmac, timingSafeEqual } from "node:crypto"

export function verifySignedPayload(payload: string, secret: string, signature: string): boolean {
  if (!secret || !signature) return false
  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function webhookConfigured(secret: string | undefined): boolean {
  return Boolean(secret && secret.length >= 16)
}

export function paymentWebhookSecret(): string {
  return process.env.BINANCE_PAY_API_SECRET || process.env.NOWPAYMENTS_IPN_SECRET || ""
}
