import { PART_CATEGORIES } from "./catalog"

const PHOTO_SLUGS = new Set([
  "pantallas",
  "baterias",
  "tapas",
  "camaras",
  "flex-carga",
  "altavoces",
  "sensores",
  "botones",
])

export function categorySlugFromName(name: string): string {
  const lower = name.toLowerCase()
  const hit = PART_CATEGORIES.find((cat) => {
    if (!PHOTO_SLUGS.has(cat.slug)) return false
    return lower.includes(cat.slug.replace("-", " ")) || lower.includes(cat.name.toLowerCase().split(" ")[0]!)
  })
  if (hit) return hit.slug
  if (lower.includes("pantalla") || lower.includes("oled") || lower.includes("lcd")) return "pantallas"
  if (lower.includes("bater")) return "baterias"
  if (lower.includes("tapa") || lower.includes("housing") || lower.includes("chasis")) return "tapas"
  if (lower.includes("camara") || lower.includes("cámara")) return "camaras"
  if (lower.includes("carga") || lower.includes("flex") || lower.includes("dock")) return "flex-carga"
  if (lower.includes("altavoz") || lower.includes("speaker") || lower.includes("auricular")) return "altavoces"
  if (lower.includes("sensor") || lower.includes("proxim")) return "sensores"
  if (lower.includes("boton") || lower.includes("botón") || lower.includes("power") || lower.includes("volumen")) return "botones"
  if (lower.includes("original usada") || lower.includes("usada")) return "pantallas"
  return "pantallas"
}

export function partImageHint(item: {
  category: string
  categorySlug?: string
  qualityType?: string | null
  fullName?: string
}): string {
  if (item.categorySlug && PHOTO_SLUGS.has(item.categorySlug)) return item.categorySlug
  if (item.categorySlug === "original-usada") {
    return item.qualityType || item.fullName || item.category
  }
  return item.category
}

export function partImageSrc(categoryNameOrSlug: string): string {
  return `/parts/${categorySlugFromName(categoryNameOrSlug)}.jpg`
}
