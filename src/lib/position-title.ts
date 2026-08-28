export type CatalogPosition = {
  category: string
  model?: string
  quality?: string
  brand?: string
}

/** Title path: Categoría → Modelo → Calidad → Marca */
export function positionCrumbs(pos: CatalogPosition): { label: string; key: string }[] {
  const crumbs = [{ key: "cat", label: pos.category }]
  if (pos.model) crumbs.push({ key: "model", label: pos.model })
  if (pos.quality) crumbs.push({ key: "quality", label: pos.quality })
  if (pos.brand) crumbs.push({ key: "brand", label: pos.brand })
  return crumbs
}

export function positionHeading(pos: CatalogPosition): string {
  const category = pos.category.trim()
  const quality = pos.quality?.trim()
  const brand = pos.brand?.trim()
  const bits = [category]
  if (quality && quality.toLowerCase() !== category.toLowerCase()) bits.push(quality)
  if (brand && brand.toLowerCase() !== category.toLowerCase()) bits.push(brand)
  if (pos.model) return `${bits.join(" ")} para ${pos.model}`
  return `${bits.join(" ")} para iPhone`
}
