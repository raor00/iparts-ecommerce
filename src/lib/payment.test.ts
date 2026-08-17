import { describe, expect, it } from "vitest"
import { processPayment } from "./payment"

describe("processPayment", () => {
  it("records Binance with a split and keeps Zelle awaiting confirmation", () => {
    const empty = processPayment({ amount: "12.00", method: "binance_pay", token: "" })
    expect(empty.ok).toBe(false)
    const paid = processPayment({ amount: "12.00", method: "binance_pay", token: "intent_demo" })
    expect(paid.ok).toBe(true)
    if (paid.ok) {
      expect(paid.status).toBe("paid")
      expect(paid.split.ownerFee).not.toBe("0.00")
    }
    const zelle = processPayment({ amount: "50.00", method: "zelle", zelleReference: "ANA-9921" })
    expect(zelle.ok).toBe(true)
    if (zelle.ok) expect(zelle.status).toBe("awaiting_payment")
    const card = processPayment({ amount: "20.00", method: "card_intl", token: "x" })
    expect(card.ok).toBe(false)
  })
})

