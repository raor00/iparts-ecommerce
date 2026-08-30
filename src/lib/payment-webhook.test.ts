import { createHmac } from "node:crypto"
import { describe, expect, it } from "vitest"
import { verifySignedPayload, webhookConfigured } from "./payment-webhook"

describe("payment webhook signature", () => {
  it("accepts the HMAC of the exact payload and rejects a tampered body", () => {
    const secret = "merchant-secret-16+"
    const payload = JSON.stringify({ orderId: "ORD-1", status: "paid", processorPaymentId: "pay_1" })
    const sig = createHmac("sha256", secret).update(payload).digest("hex")
    expect(verifySignedPayload(payload, secret, sig)).toBe(true)
    expect(verifySignedPayload(payload + "x", secret, sig)).toBe(false)
    expect(verifySignedPayload(payload, secret, "00")).toBe(false)
    expect(webhookConfigured(undefined)).toBe(false)
    expect(webhookConfigured(secret)).toBe(true)
  })
})
