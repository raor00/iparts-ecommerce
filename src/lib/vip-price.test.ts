import { describe, expect, it } from "vitest"
import { COMMON_MARKUP, selectOfferPrice } from "./vip-price"

describe("selectOfferPrice", () => {
  it("gives VIP the wholesale ERP price and common shoppers the markup", () => {
    const wholesale = 50
    const vip = selectOfferPrice({ salePrice: wholesale, isVip: true })
    const common = selectOfferPrice({ salePrice: String(wholesale), isVip: false })
    expect(Number(vip.unitPrice)).toBe(wholesale)
    expect(Number(common.unitPrice)).toBe(Math.round(wholesale * COMMON_MARKUP * 100) / 100)
    expect(Number(common.unitPrice)).toBeGreaterThan(Number(vip.unitPrice))
    expect(vip.compareAt).toBe(common.unitPrice)
  })
})
