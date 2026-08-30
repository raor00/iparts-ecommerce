import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { clarityTagUrl } from "./clarity"

describe("clarity tracking", () => {
  it("builds the official tag URL only when a project id exists", () => {
    expect(clarityTagUrl(undefined)).toBeNull()
    expect(clarityTagUrl("  ")).toBeNull()
    expect(clarityTagUrl("abc123")).toBe("https://www.clarity.ms/tag/abc123")
  })
})

describe("product watermark", () => {
  it("embeds the iParts logo watermark on product photos", () => {
    const src = readFileSync(join(process.cwd(), "src/components/product-photo.tsx"), "utf8")
    expect(src).toContain("iparts-logo")
    expect(src).toContain('className="wm"')
  })
})
