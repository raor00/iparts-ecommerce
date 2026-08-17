import { shopConfig } from "./config"
import { fetchErpCatalog, fetchErpTaxonomy, type ErpCatalogItem, type ErpCatalogQuery, type ErpTaxonomy } from "./erp-stock"
import { facetsFromItems, filterCatalog } from "./facets"
import { previewCatalog } from "./preview-catalog"

export type CatalogLoad = {
  items: ErpCatalogItem[]
  source: "erp" | "preview"
  error: string | null
  taxonomy: ErpTaxonomy
}

export async function loadShopCatalog(query: ErpCatalogQuery = {}): Promise<CatalogLoad> {
  const cfg = shopConfig()
  const scope = { model: query.model, category: query.category }
  try {
    const scoped = await fetchErpCatalog({
      erpBaseUrl: cfg.erpBaseUrl,
      apiKey: cfg.ecommerceApiKey,
      ...scope,
    })
    if (scoped.length > 0) {
      let taxonomy: ErpTaxonomy
      try {
        taxonomy = await fetchErpTaxonomy({ erpBaseUrl: cfg.erpBaseUrl, apiKey: cfg.ecommerceApiKey })
        taxonomy = {
          ...taxonomy,
          ...facetsFromItems(scoped),
          categories: taxonomy.categories,
        }
      } catch {
        taxonomy = facetsFromItems(scoped)
      }
      return { items: filterCatalog(scoped, query), source: "erp", error: null, taxonomy }
    }
    const previewScope = filterCatalog(previewCatalog(query.model), scope)
    return {
      items: filterCatalog(previewScope, query),
      source: "preview",
      error: null,
      taxonomy: facetsFromItems(previewScope),
    }
  } catch (err) {
    const previewScope = filterCatalog(previewCatalog(query.model), scope)
    return {
      items: filterCatalog(previewScope, query),
      source: "preview",
      error: err instanceof Error ? err.message : "ERP no disponible",
      taxonomy: facetsFromItems(previewScope),
    }
  }
}

/** Catalog used to price the cart. Falls back to the merchandising preview. */
export async function resolvePricedCatalog(model?: string): Promise<ErpCatalogItem[]> {
  return (await loadShopCatalog(model ? { model } : {})).items
}
