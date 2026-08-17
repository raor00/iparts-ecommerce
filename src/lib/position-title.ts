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
  const bits = [pos.category]
  if (pos.quality) bits.push(pos.quality)
  if (pos.brand) bits.push(pos.brand)
  if (pos.model) return `${bits.join(" ")} para ${pos.model}`
  return `${bits.join(" ")} para iPhone`
}
