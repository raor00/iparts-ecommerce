import { describe, expect, it } from "vitest"
import {
  SHOP_IPHONE_MODELS,
  isShopIphoneModel,
  modelFromSlug,
  modelSlug,
  modelsBySeries,
} from "./catalog"

describe("shop iPhone catalog", () => {
  it("covers every series from XR through 17 Pro Max and excludes pre-XR", () => {
    expect(SHOP_IPHONE_MODELS).toContain("iPhone XR")
    expect(SHOP_IPHONE_MODELS).toContain("iPhone 17 Pro Max")
    expect(SHOP_IPHONE_MODELS).toContain("iPhone 17 Air")
    expect(SHOP_IPHONE_MODELS).not.toContain("iPhone X")
    expect(SHOP_IPHONE_MODELS).not.toContain("iPhone 8")
    expect(isShopIphoneModel("iPhone 14 Pro")).toBe(true)
    expect(isShopIphoneModel("iPhone SE (2nd Gen)")).toBe(false)
    const series = modelsBySeries().map((g) => g.series)
    expect(series).toEqual(expect.arrayContaining(["XR", "11", "12", "13", "14", "15", "16", "16e", "17"]))
  })

  it("round-trips model slugs used in catalog routes", () => {
    for (const model of SHOP_IPHONE_MODELS) {
      expect(modelFromSlug(modelSlug(model))).toBe(model)
    }
  })
})
