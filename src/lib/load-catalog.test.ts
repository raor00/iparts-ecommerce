import { describe, expect, it } from "vitest"
import { resolvePricedCatalog } from "./load-catalog"
import { pricedCartAdd } from "./reprice"
import { selectOfferPrice } from "./vip-price"

describe("resolvePricedCatalog", () => {
  it("can price a preview SKU for a common shopper when ERP is down", async () => {
    const catalog = await resolvePricedCatalog("iPhone 16 Pro Max")
    const screen = catalog.find((row) => row.fullName.toLowerCase().includes("pantalla"))
    expect(screen).toBeTruthy()
    const expected = selectOfferPrice({ salePrice: screen!.salePrice, isVip: false }).unitPrice
    const line = pricedCartAdd({
      sku: screen!.sku,
      clientUnitPrice: "0.01",
      catalog,
      isVip: false,
    })
    expect(line.unitPrice).toBe(expected)
    expect(line.unitPrice).not.toBe("0.01")
  })
})
