import { describe, expect, it } from "vitest"
import { brandInitials, brandLogoSrc, brandSlug } from "./brand-mark"

describe("brand marks", () => {
  it("maps known makers to logo files", () => {
    expect(brandLogoSrc("JK")).toBe("/brand/makers/jk.png")
    expect(brandLogoSrc("gx")).toBe("/brand/makers/gx.png")
    expect(brandLogoSrc("ZY")).toBe("/brand/makers/zy.png")
    expect(brandLogoSrc("OEM")).toBe("/brand/makers/oem.svg")
    expect(brandLogoSrc("Amp")).toBe("/brand/makers/amp.svg")
  })

  it("returns null for unknown or empty brands", () => {
    expect(brandLogoSrc(null)).toBeNull()
    expect(brandLogoSrc("")).toBeNull()
    expect(brandLogoSrc("Compatible")).toBeNull()
  })

  it("slugs and initials stay stable", () => {
    expect(brandSlug("Soft OLED")).toBe("soft-oled")
    expect(brandInitials("JK")).toBe("JK")
    expect(brandInitials("Soft OLED")).toBe("SO")
  })
})
