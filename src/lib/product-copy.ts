import { categorySlugFromName } from "./part-visual"
import type { ErpCatalogItem } from "./erp-stock"

const KIND_BY_SLUG: Record<string, string> = {
  pantallas: "Pantalla",
  baterias: "Batería",
  tapas: "Tapa",
  camaras: "Cámara",
  "flex-carga": "Flex de carga",
  altavoces: "Altavoz",
  sensores: "Sensor",
  botones: "Botón",
}

export type ProductCopy = {
  title: string
  kind: string
  technology: string | null
  model: string | null
  modelShort: string | null
  brand: string | null
  origin: "Original" | "Original usada" | null
  chips: string[]
}

export function shortModelLabel(model?: string | null): string | null {
  if (!model?.trim()) return null
  if (/^iphone\s+xr$/i.test(model)) return "XR"
  const short = model.replace(/^iphone\s+/i, "").toUpperCase()
  return short.replace(/\b16E\b/, "16e")
}

export function partKindLabel(item: Pick<ErpCatalogItem, "category" | "categorySlug" | "qualityType" | "fullName">): string {
  if (item.categorySlug === "original-usada" || /original usada/i.test(item.category)) {
    const hint = item.qualityType || item.fullName || item.category
    const slug = categorySlugFromName(hint)
    return KIND_BY_SLUG[slug] ?? "Repuesto"
  }
  const slug = item.categorySlug && KIND_BY_SLUG[item.categorySlug] ? item.categorySlug : categorySlugFromName(item.category)
  return KIND_BY_SLUG[slug] ?? item.category
}

export function technologyLabel(quality?: string | null, qualityType?: string | null): string | null {
  const raw = (qualityType && !/^caja /i.test(qualityType) ? qualityType : quality)?.trim()
  if (!raw) return null
  if (/^original usada$/i.test(raw)) return null
  const asKind = raw.toLowerCase()
  if (Object.values(KIND_BY_SLUG).some((kind) => kind.toLowerCase() === asKind)) return null
  return raw
}

export function originLabel(item: Pick<ErpCatalogItem, "brand" | "quality" | "category" | "categorySlug">): ProductCopy["origin"] {
  const blob = `${item.quality ?? ""} ${item.category ?? ""} ${item.categorySlug ?? ""}`.toLowerCase()
  if (blob.includes("original usada")) return "Original usada"
  if ((item.brand ?? "").toLowerCase() === "oem" || /^original$/i.test(item.quality ?? "")) return "Original"
  return null
}

export function productCopy(item: ErpCatalogItem): ProductCopy {
  const kind = partKindLabel(item)
  const technology = technologyLabel(item.quality, item.qualityType)
  const model = item.models[0] ?? null
  const brand = item.brand
  const origin = originLabel(item)
  const head = [kind, technology].filter(Boolean).join(" ")
  const title = model ? `${head} para ${model}` : head
  const chips = [origin, brand, technology].filter((value, index, all): value is string => {
    return Boolean(value) && all.indexOf(value) === index
  })
  return {
    title,
    kind,
    technology,
    model,
    modelShort: shortModelLabel(model),
    brand,
    origin,
    chips,
  }
}
