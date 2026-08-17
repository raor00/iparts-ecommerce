import { describe, expect, it } from "vitest"
import { facetsFromItems, filterCatalog } from "./facets"
import { previewCatalog } from "./preview-catalog"
import { brandInitials } from "./brand-mark"

describe("catalog facets", () => {
  it("exposes model, quality and brand from mapped SKUs", () => {
    const items = previewCatalog("iPhone 16 Pro Max")
    const facets = facetsFromItems(items)
    expect(facets.models).toContain("iPhone 16 Pro Max")
    expect(facets.qualities.length).toBeGreaterThan(0)
    expect(facets.brands.length).toBeGreaterThan(0)
    const oledJk = filterCatalog(items, { quality: "OLED", brand: "JK" })
    expect(oledJk.length).toBeGreaterThan(0)
    expect(oledJk.every((row) => row.quality === "OLED" && row.brand === "JK")).toBe(true)
    expect(oledJk[0]!.sku.startsWith("PREV-")).toBe(true)
    expect(brandInitials("JK")).toBe("JK")
    expect(brandInitials("Soft OLED")).toBe("SO")
  })
})
