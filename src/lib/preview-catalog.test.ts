import { describe, expect, it } from "vitest"
import { categorySlugFromName } from "./part-visual"
import { previewCatalog, previewWholesalePrice } from "./preview-catalog"
import { selectOfferPrice } from "./vip-price"

describe("preview merchandising catalog", () => {
  it("builds one row per category for a shop model", () => {
    const rows = previewCatalog("iPhone 16 Pro Max")
    expect(rows.length).toBeGreaterThanOrEqual(8)
    expect(rows.every((row) => row.models.includes("iPhone 16 Pro Max"))).toBe(true)
    expect(rows.some((row) => row.category.toLowerCase().includes("pantalla"))).toBe(true)
    expect(categorySlugFromName("Pantallas")).toBe("pantallas")
    expect(categorySlugFromName("OLED iPhone")).toBe("pantallas")
    expect(categorySlugFromName("Original usada")).toBe("pantallas")
    expect(categorySlugFromName("Batería")).toBe("baterias")
  })

  it("includes Original usada SKUs for iPhone 11", () => {
    const rows = previewCatalog("iPhone 11")
    const used = rows.filter((row) => row.quality === "Original usada")
    expect(used.length).toBeGreaterThan(0)
    expect(used.every((row) => row.models.includes("iPhone 11"))).toBe(true)
    expect(used.some((row) => row.categorySlug === "original-usada")).toBe(true)
    expect(used.some((row) => row.fullName.toLowerCase().includes("pantalla"))).toBe(true)
  })

  it("maps a different wholesale price per screen quality", () => {
    expect(previewWholesalePrice({ categorySlug: "pantallas", quality: "OLED", brand: "JK" })).toBe("185.00")
    expect(previewWholesalePrice({ categorySlug: "pantallas", quality: "Incell", brand: "GX" })).toBe("78.00")
    expect(previewWholesalePrice({ categorySlug: "pantallas", quality: "Soft OLED", brand: "ZY" })).toBe("142.00")
    const oled = previewCatalog("iPhone 17 Pro Max").find((row) => row.quality === "OLED" && row.brand === "JK")
    const incell = previewCatalog("iPhone 17 Pro Max").find((row) => row.quality === "Incell" && row.brand === "GX")
    expect(oled?.salePrice).toBe("185.00")
    expect(incell?.salePrice).toBe("78.00")
    expect(selectOfferPrice({ salePrice: oled!.salePrice, isVip: false }).unitPrice).toBe("218.30")
    expect(selectOfferPrice({ salePrice: incell!.salePrice, isVip: false }).unitPrice).toBe("92.04")
  })
})
