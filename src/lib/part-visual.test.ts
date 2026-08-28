import { describe, expect, it } from "vitest"
import { categorySlugFromName, partImageHint, partImageSrc } from "./part-visual"

describe("part image mapping", () => {
  it("never points original-usada at a missing jpg", () => {
    expect(categorySlugFromName("Original usada")).toBe("pantallas")
    expect(partImageSrc("Original usada")).toBe("/parts/pantallas.jpg")
  })

  it("uses the part type photo for Original usada rows", () => {
    expect(
      partImageSrc(
        partImageHint({
          category: "Original usada",
          categorySlug: "original-usada",
          qualityType: "Batería",
          fullName: "Batería Original usada OEM iPhone 11",
        }),
      ),
    ).toBe("/parts/baterias.jpg")
    expect(
      partImageSrc(
        partImageHint({
          category: "Original usada",
          categorySlug: "original-usada",
          qualityType: "Tapa / Housing",
        }),
      ),
    ).toBe("/parts/tapas.jpg")
  })

  it("does not let quality names steal the category photo", () => {
    expect(partImageHint({ category: "Baterías", categorySlug: "baterias", qualityType: "Con flex" })).toBe(
      "baterias",
    )
  })
})
