import { describe, expect, it } from "vitest"
import { categorySlugFromName } from "./part-visual"
import { previewCatalog } from "./preview-catalog"

describe("preview merchandising catalog", () => {
  it("builds one row per category for a shop model", () => {
    const rows = previewCatalog("iPhone 16 Pro Max")
    expect(rows.length).toBeGreaterThanOrEqual(8)
    expect(rows.every((row) => row.models.includes("iPhone 16 Pro Max"))).toBe(true)
    expect(rows.some((row) => row.category.toLowerCase().includes("pantalla"))).toBe(true)
    expect(categorySlugFromName("Pantallas")).toBe("pantallas")
    expect(categorySlugFromName("OLED iPhone")).toBe("pantallas")
  })

  it("includes Original usada SKUs for iPhone 11", () => {
    const rows = previewCatalog("iPhone 11")
    const used = rows.filter((row) => row.quality === "Original usada")
    expect(used.length).toBeGreaterThan(0)
    expect(used.every((row) => row.models.includes("iPhone 11"))).toBe(true)
    expect(used.some((row) => row.categorySlug === "original-usada")).toBe(true)
    expect(used.some((row) => row.fullName.toLowerCase().includes("pantalla"))).toBe(true)
  })
})
