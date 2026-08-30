import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { resolvePricedCatalog } from "./load-catalog"
import { pricedCartAdd } from "./reprice"
import { addShopProduct } from "./shop-catalog"
import { loadDb, saveDb } from "./store"
import { selectOfferPrice } from "./vip-price"

const previousDataPath = process.env.SHOP_DATA_PATH
const previousErp = process.env.ERP_API_URL
const previousKey = process.env.ECOMMERCE_API_KEY

afterEach(() => {
  if (previousDataPath === undefined) delete process.env.SHOP_DATA_PATH
  else process.env.SHOP_DATA_PATH = previousDataPath
  if (previousErp === undefined) delete process.env.ERP_API_URL
  else process.env.ERP_API_URL = previousErp
  if (previousKey === undefined) delete process.env.ECOMMERCE_API_KEY
  else process.env.ECOMMERCE_API_KEY = previousKey
})

describe("resolvePricedCatalog", () => {
  it("returns an empty catalog when the shop has no products and ERP is unset", async () => {
    const dir = mkdtempSync(join(tmpdir(), "iparts-shop-"))
    process.env.SHOP_DATA_PATH = join(dir, "store.json")
    delete process.env.ERP_API_URL
    delete process.env.ECOMMERCE_API_KEY
    const catalog = await resolvePricedCatalog("iPhone 16 Pro Max")
    expect(catalog).toEqual([])
  })

  it("prices an owner-loaded SKU and ignores the client unit price", async () => {
    const dir = mkdtempSync(join(tmpdir(), "iparts-shop-"))
    const path = join(dir, "store.json")
    process.env.SHOP_DATA_PATH = path
    delete process.env.ERP_API_URL
    delete process.env.ECOMMERCE_API_KEY
    const db = loadDb(path)
    addShopProduct(db, {
      categorySlug: "pantallas",
      model: "iPhone 16 Pro Max",
      brand: "JK",
      quality: "OLED",
      wholesalePrice: 185,
      quantity: 4,
    })
    saveDb(path, db)

    const catalog = await resolvePricedCatalog("iPhone 16 Pro Max")
    const screen = catalog.find((row) => row.fullName.toLowerCase().includes("pantalla"))
    expect(screen).toBeTruthy()
    expect(screen!.sku).toBe("PANT-OLED-JK-16PROMAX")
    const expected = selectOfferPrice({ salePrice: screen!.salePrice, isVip: false }).unitPrice
    const line = pricedCartAdd({
      sku: screen!.sku,
      clientUnitPrice: "0.01",
      catalog,
      isVip: false,
    })
    expect(line.unitPrice).toBe(expected)
    expect(line.unitPrice).not.toBe("0.01")
  })
})
