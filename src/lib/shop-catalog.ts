import { isShopIphoneModel, type ShopIphoneModel } from "./catalog"
import type { ErpCatalogItem } from "./erp-stock"
import type { Db, ShopProduct } from "./store"

export const SHOP_CATEGORY_SLUGS = ["pantallas", "baterias"] as const
export type ShopCategorySlug = (typeof SHOP_CATEGORY_SLUGS)[number]

export type ShopProductInput = {
  categorySlug: ShopCategorySlug
  model: ShopIphoneModel
  brand: string
  quality: string
  wholesalePrice: number
  quantity: number
}

function skuToken(value: string): string {
  return value
    .replace(/iPhone\s+/gi, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
}

export function buildShopSku(input: {
  categorySlug: ShopCategorySlug
  quality: string
  brand: string
  model: string
}): string {
  const prefix = input.categorySlug === "pantallas" ? "PANT" : "BAT"
  return `${prefix}-${skuToken(input.quality)}-${skuToken(input.brand)}-${skuToken(input.model)}`
}

export function productIdentity(input: {
  categorySlug: string
  model: string
  brand: string
  quality: string
}): string {
  return `${input.categorySlug}|${input.model}|${input.brand}|${input.quality}`.toLowerCase()
}

function isShopCategorySlug(value: string): value is ShopCategorySlug {
  return (SHOP_CATEGORY_SLUGS as readonly string[]).includes(value)
}

export function parseShopProductInput(body: unknown): ShopProductInput {
  const raw = (body ?? {}) as Record<string, unknown>
  const categorySlug = typeof raw.categorySlug === "string" ? raw.categorySlug.trim() : ""
  if (!isShopCategorySlug(categorySlug)) throw new Error("Categoría no válida")
  const model = typeof raw.model === "string" ? raw.model.trim() : ""
  if (!isShopIphoneModel(model)) throw new Error("Modelo no válido")
  const brand = typeof raw.brand === "string" ? raw.brand.trim() : ""
  if (!brand) throw new Error("Marca requerida")
  const quality = typeof raw.quality === "string" ? raw.quality.trim() : ""
  if (!quality) throw new Error("Calidad requerida")
  const wholesalePrice = Number(raw.wholesalePrice)
  if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0) {
    throw new Error("El precio mayorista debe ser mayor que 0")
  }
  const quantity = Number(raw.quantity)
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("La cantidad debe ser un entero mayor o igual a 0")
  }
  return { categorySlug, model, brand, quality, wholesalePrice, quantity }
}

export function addShopProduct(db: Db, input: ShopProductInput): ShopProduct {
  const sku = buildShopSku(input)
  if (db.products.some((row) => row.sku === sku)) {
    throw new Error("Ya existe un producto con ese SKU")
  }
  const identity = productIdentity(input)
  if (db.products.some((row) => productIdentity(row) === identity)) {
    throw new Error("Ya existe un producto con esa categoría, modelo, marca y calidad")
  }
  const product: ShopProduct = {
    sku,
    categorySlug: input.categorySlug,
    model: input.model,
    brand: input.brand,
    quality: input.quality,
    wholesalePrice: input.wholesalePrice,
    quantity: input.quantity,
    active: true,
    createdAt: new Date().toISOString(),
  }
  db.products.push(product)
  db.stock[sku] = input.quantity
  return product
}

export function deactivateShopProduct(db: Db, sku: string): ShopProduct {
  const product = db.products.find((row) => row.sku === sku)
  if (!product) throw new Error("Producto no encontrado")
  product.active = false
  return product
}

export function updateShopProduct(
  db: Db,
  sku: string,
  patch: { wholesalePrice?: number; quantity?: number; active?: boolean },
): ShopProduct {
  const product = db.products.find((row) => row.sku === sku)
  if (!product) throw new Error("Producto no encontrado")
  if (patch.wholesalePrice != null) {
    if (!Number.isFinite(patch.wholesalePrice) || patch.wholesalePrice <= 0) {
      throw new Error("El precio mayorista debe ser mayor que 0")
    }
    product.wholesalePrice = patch.wholesalePrice
  }
  if (patch.quantity != null) {
    if (!Number.isInteger(patch.quantity) || patch.quantity < 0) {
      throw new Error("La cantidad debe ser un entero mayor o igual a 0")
    }
    product.quantity = patch.quantity
    db.stock[sku] = patch.quantity
  }
  if (typeof patch.active === "boolean") product.active = patch.active
  return product
}

function categoryLabel(slug: ShopCategorySlug): { name: string; noun: string } {
  if (slug === "baterias") return { name: "Baterías", noun: "Batería" }
  return { name: "Pantallas", noun: "Pantalla" }
}

export function shopItemsFromDb(db: Db): ErpCatalogItem[] {
  return db.products
    .filter((row) => row.active)
    .map((row) => {
      const qty = db.stock[row.sku] ?? row.quantity
      const labels = categoryLabel(row.categorySlug)
      return {
        sku: row.sku,
        fullName: `${labels.noun} ${row.quality} ${row.brand} ${row.model}`,
        category: labels.name,
        categorySlug: row.categorySlug,
        brand: row.brand,
        quality: row.quality,
        qualityType: row.quality,
        color: null,
        models: [row.model],
        quantity: qty,
        salePrice: Number(row.wholesalePrice).toFixed(2),
        inStock: qty > 0,
      }
    })
}

export function isShopSellableItem(item: {
  categorySlug?: string | null
  fullName?: string | null
  category?: string | null
}): boolean {
  const slug = (item.categorySlug ?? "").toLowerCase()
  if (slug === "pantallas" || slug === "baterias") return true
  const hay = `${item.fullName ?? ""} ${item.category ?? ""}`.toLowerCase()
  return hay.includes("pantalla") || hay.includes("bater")
}

export function filterShopSellable(items: ErpCatalogItem[]): ErpCatalogItem[] {
  return items.filter((item) => isShopSellableItem(item))
}
