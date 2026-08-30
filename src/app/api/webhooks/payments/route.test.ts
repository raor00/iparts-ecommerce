import { describe, expect, it } from "vitest"
import { POST } from "./route"

describe("POST /api/webhooks/payments", () => {
  it("returns 503 when merchant webhook secrets are not configured", async () => {
    const prevB = process.env.BINANCE_PAY_API_SECRET
    const prevN = process.env.NOWPAYMENTS_IPN_SECRET
    delete process.env.BINANCE_PAY_API_SECRET
    delete process.env.NOWPAYMENTS_IPN_SECRET
    const res = await POST(new Request("http://shop.local/api/webhooks/payments", { method: "POST", body: "{}" }))
    expect(res.status).toBe(503)
    if (prevB) process.env.BINANCE_PAY_API_SECRET = prevB
    if (prevN) process.env.NOWPAYMENTS_IPN_SECRET = prevN
  })
})
