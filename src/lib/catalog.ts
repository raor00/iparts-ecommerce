/** iPhone models sold in the storefront: XR through 17 Pro Max, every series. */
export const SHOP_IPHONE_MODELS = [
  "iPhone 17 Pro Max",
  "iPhone 17 Pro",
  "iPhone 17 Air",
  "iPhone 17",
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 16e",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13 Mini",
  "iPhone 13",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12 Mini",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone XR",
] as const

export type ShopIphoneModel = (typeof SHOP_IPHONE_MODELS)[number]

export const PART_CATEGORIES = [
  { slug: "pantallas", name: "Pantallas" },
  { slug: "baterias", name: "Baterías" },
  { slug: "tapas", name: "Tapas / Housing" },
  { slug: "camaras", name: "Cámaras" },
  { slug: "flex-carga", name: "Flex de carga" },
  { slug: "altavoces", name: "Altavoces" },
  { slug: "sensores", name: "Sensores" },
  { slug: "botones", name: "Botones" },
  { slug: "original-usada", name: "Original usada" },
] as const

export const ORIGINAL_USADA_MODELS = ["iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max"] as const

export const ORIGINAL_USADA_PARTS = [
  { slug: "pantallas", name: "Pantalla", price: "92.00" },
  { slug: "baterias", name: "Batería", price: "16.00" },
  { slug: "tapas", name: "Tapa / Housing", price: "48.00" },
  { slug: "camaras", name: "Cámara", price: "32.00" },
  { slug: "flex-carga", name: "Flex de carga", price: "12.00" },
] as const

export function isShopIphoneModel(value: string): value is ShopIphoneModel {
  return (SHOP_IPHONE_MODELS as readonly string[]).includes(value)
}

export function modelSlug(model: string): string {
  return model
    .toLowerCase()
    .replace(/^iphone\s+/, "")
    .replace(/\s+/g, "-")
}

export function modelFromSlug(slug: string): ShopIphoneModel | null {
  const found = SHOP_IPHONE_MODELS.find((model) => modelSlug(model) === slug)
  return found ?? null
}

export function seriesFromModel(model: string): string {
  if (model === "iPhone XR") return "XR"
  const match = model.match(/iPhone\s+(16e|\d+)/i)
  return match?.[1] ?? model
}

export function modelsBySeries(): { series: string; models: ShopIphoneModel[] }[] {
  const groups = new Map<string, ShopIphoneModel[]>()
  for (const model of SHOP_IPHONE_MODELS) {
    const series = seriesFromModel(model)
    const list = groups.get(series) ?? []
    list.push(model)
    groups.set(series, list)
  }
  return [...groups.entries()].map(([series, models]) => ({ series, models }))
}
