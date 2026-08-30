import { describe, expect, it } from "vitest"
import {
  SHOP_CATEGORY_SLUGS,
  addShopProduct,
  buildShopSku,
  deactivateShopProduct,
  updateShopProduct,
  filterShopSellable,
  isShopSellableItem,
  parseShopProductInput,
  productIdentity,
  shopItemsFromDb,
} from "./shop-catalog"
import { loadDb, type Db } from "./store"

function emptyDb(): Db {
  return loadDb("/tmp/iparts-no-such-db.json")
}

describe("shop catalog identity", () => {
  it("builds SKUs from category quality brand model", () => {
    expect(SHOP_CATEGORY_SLUGS).toEqual(["pantallas", "baterias"])
    expect(
      buildShopSku({
        categorySlug: "pantallas",
        quality: "OLED",
        brand: "JK",
        model: "iPhone 16 Pro Max",
      }),
    ).toBe("PANT-OLED-JK-16PROMAX")
    expect(
      buildShopSku({
        categorySlug: "baterias",
        quality: "Con flex",
        brand: "Amp",
        model: "iPhone 15",
      }),
    ).toBe("BAT-CONFLEX-AMP-15")
  })

  it("normalizes product identity", () => {
    expect(
      productIdentity({
        categorySlug: "Pantallas",
        model: "iPhone 16 Pro Max",
        brand: "JK",
        quality: "OLED",
      }),
    ).toBe("pantallas|iphone 16 pro max|jk|oled")
  })
})

describe("parseShopProductInput", () => {
  it("accepts a valid pantalla", () => {
    expect(
      parseShopProductInput({
        categorySlug: "pantallas",
        model: "iPhone 16 Pro Max",
        brand: " JK ",
        quality: " OLED ",
        wholesalePrice: 185,
        quantity: 4,
      }),
    ).toEqual({
      categorySlug: "pantallas",
      model: "iPhone 16 Pro Max",
      brand: "JK",
      quality: "OLED",
      wholesalePrice: 185,
      quantity: 4,
    })
  })

  it("rejects invalid fields in Spanish", () => {
    expect(() => parseShopProductInput({ categorySlug: "tapas" })).toThrow(/categor/i)
    expect(() =>
      parseShopProductInput({ categorySlug: "pantallas", model: "iPhone 8" }),
    ).toThrow(/modelo/i)
    expect(() =>
      parseShopProductInput({
        categorySlug: "pantallas",
        model: "iPhone 16 Pro Max",
        brand: "  ",
      }),
    ).toThrow(/marca/i)
    expect(() =>
      parseShopProductInput({
        categorySlug: "pantallas",
        model: "iPhone 16 Pro Max",
        brand: "JK",
        quality: "",
      }),
    ).toThrow(/calidad/i)
    expect(() =>
      parseShopProductInput({
        categorySlug: "pantallas",
        model: "iPhone 16 Pro Max",
        brand: "JK",
        quality: "OLED",
        wholesalePrice: 0,
      }),
    ).toThrow(/precio/i)
    expect(() =>
      parseShopProductInput({
        categorySlug: "pantallas",
        model: "iPhone 16 Pro Max",
        brand: "JK",
        quality: "OLED",
        wholesalePrice: 10,
        quantity: -1,
      }),
    ).toThrow(/cantidad/i)
  })
})

describe("addShopProduct / deactivate / shopItemsFromDb", () => {
  const input = {
    categorySlug: "pantallas" as const,
    model: "iPhone 16 Pro Max" as const,
    brand: "JK",
    quality: "OLED",
    wholesalePrice: 185,
    quantity: 4,
  }

  it("stores unique SKU and identity, maps active products to catalog items", () => {
    const db = emptyDb()
    const product = addShopProduct(db, input)
    expect(product.sku).toBe("PANT-OLED-JK-16PROMAX")
    expect(product.active).toBe(true)
    expect(db.stock[product.sku]).toBe(4)
    expect(() => addShopProduct(db, input)).toThrow()
    expect(() =>
      addShopProduct(db, { ...input, quality: "oled" }),
    ).toThrow()

    const items = shopItemsFromDb(db)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      sku: "PANT-OLED-JK-16PROMAX",
      fullName: "Pantalla OLED JK iPhone 16 Pro Max",
      categorySlug: "pantallas",
      brand: "JK",
      quality: "OLED",
      models: ["iPhone 16 Pro Max"],
      salePrice: "185.00",
      quantity: 4,
      inStock: true,
    })

    deactivateShopProduct(db, product.sku)
    expect(db.products[0].active).toBe(false)
    expect(shopItemsFromDb(db)).toEqual([])
    expect(() => deactivateShopProduct(db, "NOPE")).toThrow()

    updateShopProduct(db, product.sku, { wholesalePrice: 200, quantity: 9, active: true })
    const edited = shopItemsFromDb(db)[0]
    expect(edited?.salePrice).toBe("200.00")
    expect(edited?.quantity).toBe(9)
    expect(db.stock[product.sku]).toBe(9)
    updateShopProduct(db, product.sku, { active: false })
    expect(shopItemsFromDb(db)).toEqual([])
  })

  it("maps batería display name", () => {
    const db = emptyDb()
    addShopProduct(db, {
      categorySlug: "baterias",
      model: "iPhone 16 Pro Max",
      brand: "Amp",
      quality: "Con flex",
      wholesalePrice: 28,
      quantity: 0,
    })
    const item = shopItemsFromDb(db)[0]
    expect(item.fullName).toBe("Batería Con flex Amp iPhone 16 Pro Max")
    expect(item.inStock).toBe(false)
  })
})

describe("sellable filter", () => {
  it("keeps pantallas and baterías only", () => {
    expect(isShopSellableItem({ categorySlug: "pantallas", fullName: "x", category: "x" })).toBe(true)
    expect(isShopSellableItem({ categorySlug: "tapas", fullName: "Tapa", category: "Tapas" })).toBe(false)
    expect(isShopSellableItem({ categorySlug: "repuesto", fullName: "Pantalla OLED", category: "Repuesto" })).toBe(
      true,
    )
    expect(isShopSellableItem({ categorySlug: "repuesto", fullName: "Batería Amp", category: "Repuesto" })).toBe(true)
    expect(
      filterShopSellable([
        {
          sku: "A",
          fullName: "Tapa",
          category: "Tapas",
          categorySlug: "tapas",
          brand: null,
          quality: null,
          qualityType: null,
          color: null,
          models: [],
          quantity: 1,
          salePrice: "1.00",
          inStock: true,
        },
        {
          sku: "B",
          fullName: "Pantalla OLED",
          category: "Pantallas",
          categorySlug: "pantallas",
          brand: null,
          quality: null,
          qualityType: null,
          color: null,
          models: [],
          quantity: 1,
          salePrice: "1.00",
          inStock: true,
        },
      ]).map((row) => row.sku),
    ).toEqual(["B"])
  })
})
