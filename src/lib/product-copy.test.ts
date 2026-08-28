import { describe, expect, it } from "vitest"
import { productCopy, shortModelLabel } from "./product-copy"
import type { ErpCatalogItem } from "./erp-stock"

function item(over: Partial<ErpCatalogItem>): ErpCatalogItem {
  return {
    sku: "X",
    fullName: "raw",
    category: "Pantallas",
    categorySlug: "pantallas",
    brand: "JK",
    quality: "OLED",
    qualityType: "OLED",
    color: null,
    models: ["iPhone 16e"],
    quantity: 6,
    salePrice: "185.00",
    inStock: true,
    ...over,
  }
}

describe("product copy", () => {
  it("orders kind + technology + model and keeps identity chips", () => {
    const copy = productCopy(item({}))
    expect(copy.title).toBe("Pantalla OLED para iPhone 16e")
    expect(copy.chips).toEqual(["JK", "OLED"])
    expect(copy.modelShort).toBe("16e")
  })

  it("identifies original usada without repeating the phrase in the noun", () => {
    const copy = productCopy(
      item({
        category: "Original usada",
        categorySlug: "original-usada",
        brand: "OEM",
        quality: "Original usada",
        qualityType: "Batería",
        fullName: "Batería Original usada OEM iPhone 11",
        models: ["iPhone 11"],
      }),
    )
    expect(copy.title).toBe("Batería para iPhone 11")
    expect(copy.origin).toBe("Original usada")
    expect(copy.chips).toEqual(["Original usada", "OEM"])
  })

  it("shortens Pro Max models the way the counter reads them", () => {
    expect(shortModelLabel("iPhone 15 Pro Max")).toBe("15 PRO MAX")
    expect(shortModelLabel("iPhone XR")).toBe("XR")
  })
})
