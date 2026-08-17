import { describe, expect, it } from "vitest"
import { cartSubtotal } from "./cart"
import { selectOfferPrice } from "./vip-price"
import { pricedCartAdd, repriceCart } from "./reprice"
import type { ErpCatalogItem } from "./erp-stock"

const erpSale = "50.00"
const catalog: ErpCatalogItem[] = [
  {
    sku: "P-1",
    fullName: "Pantalla iPhone 15",
    category: "Pantallas",
    models: ["iPhone 15"],
    quantity: 4,
    salePrice: erpSale,
    inStock: true,
  },
]

describe("pricedCartAdd / repriceCart", () => {
  it("charges a common user the VIP markup even if the client posts 0.01", () => {
    const expected = selectOfferPrice({ salePrice: erpSale, isVip: false }).unitPrice
    expect(expected).not.toBe(erpSale)

    const added = pricedCartAdd({
      sku: "P-1",
      clientUnitPrice: "0.01",
      quantity: 1,
      catalog,
      isVip: false,
    })
    expect(added.unitPrice).toBe(expected)
    expect(added.unitPrice).not.toBe("0.01")

    const poisoned = { lines: [{ sku: "P-1", name: "hack", quantity: 1, unitPrice: "0.01" }] }
    const priced = repriceCart(poisoned, catalog, false)
    expect(priced.lines[0]!.unitPrice).toBe(expected)
    expect(cartSubtotal(priced)).toBe(expected)
    expect(cartSubtotal(priced)).not.toBe("0.01")
  })

  it("charges VIP the ERP wholesale price, not a client-posted 0.01", () => {
    const expected = selectOfferPrice({ salePrice: erpSale, isVip: true }).unitPrice
    const added = pricedCartAdd({
      sku: "P-1",
      clientUnitPrice: "0.01",
      catalog,
      isVip: true,
    })
    expect(added.unitPrice).toBe(expected)
    expect(added.unitPrice).toBe(erpSale)
    expect(added.unitPrice).not.toBe("0.01")
  })
})
