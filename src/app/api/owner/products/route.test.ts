import { afterEach, describe, expect, it, vi } from "vitest"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const dir = mkdtempSync(join(tmpdir(), "iparts-owner-"))
const dataPath = join(dir, "store.json")
process.env.SHOP_DATA_PATH = dataPath
process.env.ERP_API_URL = ""
process.env.ECOMMERCE_API_KEY = ""

vi.mock("@/lib/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/http")>()
  return {
    ...actual,
    readSession: async () => ({
      userId: "owner-1",
      email: "owner@iparts.local",
      isVip: false,
      role: "OWNER" as const,
    }),
  }
})

const { POST, GET, DELETE, PATCH } = await import("./route")

afterEach(() => {
  rmSync(dataPath, { force: true })
})

describe("OWNER product catalog API", () => {
  it("creates a unique pantalla and lists it", async () => {
    const res = await POST(
      new Request("http://shop.local/api/owner/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          categorySlug: "pantallas",
          model: "iPhone 16 Pro Max",
          brand: "JK",
          quality: "OLED",
          wholesalePrice: 185,
          quantity: 6,
        }),
      }),
    )
    expect(res.status).toBe(201)
    const created = (await res.json()) as { product: { sku: string } }
    expect(created.product.sku).toBe("PANT-OLED-JK-16PROMAX")

    const listed = await GET()
    const body = (await listed.json()) as { products: { sku: string; active: boolean }[] }
    expect(body.products).toHaveLength(1)

    const dup = await POST(
      new Request("http://shop.local/api/owner/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          categorySlug: "pantallas",
          model: "iPhone 16 Pro Max",
          brand: "JK",
          quality: "OLED",
          wholesalePrice: 190,
          quantity: 1,
        }),
      }),
    )
    expect(dup.status).toBe(409)

    const removed = await DELETE(
      new Request("http://shop.local/api/owner/products", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku: created.product.sku }),
      }),
    )
    expect(removed.status).toBe(200)

    const restored = await PATCH(
      new Request("http://shop.local/api/owner/products", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku: created.product.sku, active: true, quantity: 3, wholesalePrice: 199 }),
      }),
    )
    expect(restored.status).toBe(200)
    const edited = (await restored.json()) as { product: { active: boolean; quantity: number; wholesalePrice: number } }
    expect(edited.product.active).toBe(true)
    expect(edited.product.quantity).toBe(3)
    expect(edited.product.wholesalePrice).toBe(199)
  })
})
