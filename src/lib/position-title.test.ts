import { describe, expect, it } from "vitest"
import { positionCrumbs, positionHeading } from "./position-title"

describe("positionHeading", () => {
  it("builds a category > model > quality > brand title path", () => {
    expect(positionHeading({ category: "Pantallas" })).toBe("Pantallas para iPhone")
    expect(
      positionHeading({
        category: "Pantallas",
        model: "iPhone 16 Pro Max",
        quality: "OLED",
        brand: "JK",
      }),
    ).toBe("Pantallas OLED JK para iPhone 16 Pro Max")
    expect(positionCrumbs({ category: "Pantallas", quality: "OLED" }).map((c) => c.label)).toEqual([
      "Pantallas",
      "OLED",
    ])
  })
})
