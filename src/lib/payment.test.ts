import { describe, expect, it } from "vitest"
import { processPayment } from "./payment"

describe("processPayment", () => {
  it("rejects empty token and accepts a token for the given amount", () => {
    expect(processPayment({ amount: "12.00", token: "" }).ok).toBe(false)
    const ok = processPayment({ amount: "12.00", token: "tok_demo" })
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(ok.reference.length).toBeGreaterThan(4)
  })
})
