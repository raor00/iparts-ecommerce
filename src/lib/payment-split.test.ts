import { describe, expect, it } from "vitest"
import { PAYMENT_METHODS } from "./payment-methods"
import { PLATFORM_FEE_BPS, splitPayment } from "./payment-split"

describe("splitPayment", () => {
  it("sends the platform take to the owner and keeps processor fee from the method table", () => {
    const binance = splitPayment({ amount: "100.00", method: "binance_pay" })
    const nowp = splitPayment({ amount: "100.00", method: "nowpayments_usdt" })
    const method = PAYMENT_METHODS.find((row) => row.id === "nowpayments_usdt")!
    expect(binance.ownerBps).toBe(PLATFORM_FEE_BPS)
    expect(Number(binance.ownerFee)).toBe(2.5)
    expect(Number(binance.processorFee)).toBe(0)
    expect(Number(binance.merchantNet)).toBe(97.5)
    expect(Number(nowp.processorFee)).toBe((100 * method.processorBps) / 10_000)
    expect(Number(nowp.ownerFee) + Number(nowp.processorFee) + Number(nowp.merchantNet)).toBe(100)
  })
})
