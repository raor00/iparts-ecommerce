import { describe, expect, it } from "vitest"
import { availabilityLabel, fetchErpCatalog, mapErpPayload } from "./erp-stock"

describe("ERP stock adapter", () => {
  it("maps ERP rows to live qty/availability without inventing stock", () => {
    const mapped = mapErpPayload([
      { sku: "P-1", fullName: "Pantalla 15", category: "Pantallas", models: ["iPhone 15"], quantity: 4, salePrice: "80" },
      { sku: "B-1", fullName: "Batería XR", category: "Baterías", models: ["iPhone XR"], quantity: 0, salePrice: "18" },
    ])
    expect(mapped[0]!.inStock).toBe(true)
    expect(mapped[0]!.quantity).toBe(4)
    expect(availabilityLabel(mapped[0]!)).toBe("4 en stock")
    expect(mapped[1]!.inStock).toBe(false)
    expect(availabilityLabel(mapped[1]!)).toBe("Sin stock")
  })

  it("fetches /ecommerce/catalog with the storefront machine key", async () => {
    const payload = [{ sku: "X", fullName: "Tapa", category: "Tapas", models: ["iPhone 13"], quantity: 2, salePrice: "9.5" }]
    const items = await fetchErpCatalog({
      erpBaseUrl: "https://erp.example",
      apiKey: "secret-key",
      model: "iPhone 13",
      fetchImpl: async (url, init) => {
        expect(url).toContain("/ecommerce/catalog")
        expect(url).toContain("model=iPhone")
        expect(init.headers["X-Ecommerce-Key"]).toBe("secret-key")
        return { ok: true, status: 200, json: async () => payload }
      },
    })
    expect(items).toEqual(mapErpPayload(payload))
    expect(items[0]!.salePrice).toBe("9.50")
    expect(items[0]!.brand).toBeNull()
    expect(items[0]!.categorySlug.length).toBeGreaterThan(0)
  })
})
