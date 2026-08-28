import { describe, expect, it } from "vitest"
import { qtyCapError, toPublicCatalogItem } from "./public-catalog"

describe("public catalog", () => {
  it("strips warehouse quantity from the public item", () => {
    const pub = toPublicCatalogItem({
      sku: "P-1",
      fullName: "Pantalla",
      category: "Pantallas",
      categorySlug: "pantallas",
      brand: null,
      quality: null,
      qualityType: null,
      color: null,
      models: ["iPhone 15"],
      quantity: 47,
      salePrice: "80.00",
      inStock: true,
    })
    expect(pub.inStock).toBe(true)
    expect(pub).not.toHaveProperty("quantity")
  })

  it("returns a cap warning without implying warehouse size on the PDP", () => {
    expect(qtyCapError(5)).toEqual({
      code: "QTY_CAP",
      max: 5,
      error: "Solo puedes pedir hasta 5 unidades",
    })
  })
})
