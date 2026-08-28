import {
  ORIGINAL_USADA_MODELS,
  ORIGINAL_USADA_PARTS,
  PART_CATEGORIES,
  SHOP_IPHONE_MODELS,
  type ShopIphoneModel,
} from "./catalog"
import type { ErpCatalogItem } from "./erp-stock"

const PREVIEW_WHOLESALE: Record<(typeof PART_CATEGORIES)[number]["slug"], string> = {
  pantallas: "185.00",
  baterias: "28.00",
  tapas: "96.00",
  camaras: "64.00",
  "flex-carga": "22.00",
  altavoces: "14.00",
  sensores: "12.00",
  botones: "9.00",
  "original-usada": "92.00",
}

/** Wholesale by category + quality + brand so OLED / Incell / Soft OLED are not the same price. */
const PREVIEW_OFFER: Record<string, string> = {
  "pantallas|oled|jk": "185.00",
  "pantallas|soft oled|zy": "142.00",
  "pantallas|incell|gx": "78.00",
  "baterias|con flex|amp": "28.00",
  "baterias|sin flex|gx": "18.00",
  "tapas|original|oem": "96.00",
  "tapas|compatible|jk": "62.00",
  "camaras|original|oem": "64.00",
  "camaras|compatible|gx": "36.00",
  "flex-carga|original|oem": "22.00",
  "flex-carga|compatible|jk": "12.00",
}

export function previewWholesalePrice(input: {
  categorySlug: string
  quality: string
  brand: string
}): string {
  const key = `${input.categorySlug}|${input.quality}|${input.brand}`.toLowerCase()
  return PREVIEW_OFFER[key] ?? PREVIEW_WHOLESALE[input.categorySlug as keyof typeof PREVIEW_WHOLESALE] ?? "0.00"
}

const PREVIEW_VARIANTS: Record<(typeof PART_CATEGORIES)[number]["slug"], { quality: string; brand: string }[]> = {
  pantallas: [
    { quality: "OLED", brand: "JK" },
    { quality: "Incell", brand: "GX" },
    { quality: "Soft OLED", brand: "ZY" },
  ],
  baterias: [
    { quality: "Con flex", brand: "Amp" },
    { quality: "Sin flex", brand: "GX" },
  ],
  tapas: [
    { quality: "Original", brand: "OEM" },
    { quality: "Compatible", brand: "JK" },
  ],
  camaras: [
    { quality: "Original", brand: "OEM" },
    { quality: "Compatible", brand: "GX" },
  ],
  "flex-carga": [
    { quality: "Original", brand: "OEM" },
    { quality: "Compatible", brand: "JK" },
  ],
  altavoces: [{ quality: "Compatible", brand: "GX" }],
  sensores: [{ quality: "Compatible", brand: "JK" }],
  botones: [{ quality: "Compatible", brand: "GX" }],
  "original-usada": [],
}

export function previewCatalog(model?: string): ErpCatalogItem[] {
  const models = model
    ? SHOP_IPHONE_MODELS.filter((row) => row.toLowerCase() === model.toLowerCase())
    : [...SHOP_IPHONE_MODELS]
  const items: ErpCatalogItem[] = []
  for (const phone of models) {
    for (const cat of PART_CATEGORIES) {
      for (const variant of PREVIEW_VARIANTS[cat.slug]) {
        const sku = `PREV-${cat.slug}-${variant.quality.replace(/\s+/g, "")}-${variant.brand}-${phone.replace(/\s+/g, "")}`.toUpperCase()
        items.push({
          sku,
          fullName: `${cat.name} ${variant.quality} ${variant.brand} ${phone}`,
          category: cat.name,
          categorySlug: cat.slug,
          brand: variant.brand,
          quality: variant.quality,
          qualityType: variant.quality,
          color: null,
          models: [phone],
          quantity: cat.slug === "sensores" ? 0 : 6,
          salePrice: previewWholesalePrice({
            categorySlug: cat.slug,
            quality: variant.quality,
            brand: variant.brand,
          }),
          inStock: cat.slug !== "sensores",
        })
      }
    }
    if ((ORIGINAL_USADA_MODELS as readonly string[]).includes(phone)) {
      for (const part of ORIGINAL_USADA_PARTS) {
        items.push({
          sku: `PREV-ORIGINALUSADA-${part.slug}-${phone.replace(/\s+/g, "")}`.toUpperCase(),
          fullName: `${part.name} Original usada OEM ${phone}`,
          category: "Original usada",
          categorySlug: "original-usada",
          brand: "OEM",
          quality: "Original usada",
          qualityType: part.name,
          color: null,
          models: [phone],
          quantity: 3,
          salePrice: part.price,
          inStock: true,
        })
        items.push({
          sku: `PREV-${part.slug}-ORIGINALUSADA-OEM-${phone.replace(/\s+/g, "")}`.toUpperCase(),
          fullName: `${part.name} Original usada OEM ${phone}`,
          category: PART_CATEGORIES.find((row) => row.slug === part.slug)?.name ?? part.name,
          categorySlug: part.slug,
          brand: "OEM",
          quality: "Original usada",
          qualityType: "Original usada",
          color: null,
          models: [phone],
          quantity: 3,
          salePrice: part.price,
          inStock: true,
        })
      }
    }
  }
  return items
}

export function isPreviewSku(sku: string): boolean {
  return sku.startsWith("PREV-")
}

export function modelOfPreviewSku(sku: string): ShopIphoneModel | null {
  const item = previewCatalog().find((row) => row.sku === sku)
  return (item?.models[0] as ShopIphoneModel | undefined) ?? null
}
