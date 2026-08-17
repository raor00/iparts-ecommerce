import type { ErpCatalogItem, ErpTaxonomy } from "./erp-stock"

export function facetsFromItems(items: ErpCatalogItem[]): ErpTaxonomy {
  const categories = new Map<string, string>()
  const brands = new Set<string>()
  const qualities = new Set<string>()
  const models = new Set<string>()
  for (const item of items) {
    categories.set(item.categorySlug || item.category, item.category)
    if (item.brand) brands.add(item.brand)
    if (item.quality) qualities.add(item.quality)
    for (const model of item.models) models.add(model)
  }
  return {
    categories: [...categories.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    brands: [...brands].sort((a, b) => a.localeCompare(b, "es")),
    qualities: [...qualities].sort((a, b) => a.localeCompare(b, "es")),
    models: [...models].sort((a, b) => a.localeCompare(b, "es")),
  }
}

export function filterCatalog(
  items: ErpCatalogItem[],
  query: { category?: string; model?: string; brand?: string; quality?: string },
): ErpCatalogItem[] {
  return items.filter((item) => {
    if (query.category) {
      const cat = query.category.toLowerCase()
      if (item.categorySlug !== cat && item.category.toLowerCase() !== cat) return false
    }
    if (query.model && !item.models.some((model) => model.toLowerCase() === query.model!.toLowerCase())) {
      return false
    }
    if (query.brand && (item.brand ?? "").toLowerCase() !== query.brand.toLowerCase()) return false
    if (query.quality && (item.quality ?? "").toLowerCase() !== query.quality.toLowerCase()) return false
    return true
  })
}
