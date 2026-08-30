import { shopConfig } from "./config"
import { fetchErpCatalog, fetchErpTaxonomy, type ErpCatalogItem, type ErpCatalogQuery, type ErpTaxonomy } from "./erp-stock"
import { facetsFromItems, filterCatalog } from "./facets"
import { withDb } from "./http"
import { filterShopSellable, shopItemsFromDb } from "./shop-catalog"

export type CatalogLoad = {
  items: ErpCatalogItem[]
  source: "shop" | "erp" | "preview"
  error: string | null
  taxonomy: ErpTaxonomy
}

const emptyTaxonomy: ErpTaxonomy = { categories: [], brands: [], qualities: [], models: [] }

export async function loadShopCatalog(query: ErpCatalogQuery = {}): Promise<CatalogLoad> {
  const cfg = shopConfig()
  const shopItems = withDb((db) => shopItemsFromDb(db))
  if (shopItems.length > 0) {
    return {
      items: filterCatalog(shopItems, query),
      source: "shop",
      error: null,
      taxonomy: facetsFromItems(shopItems),
    }
  }

  try {
    const scoped = filterShopSellable(
      await fetchErpCatalog({
        erpBaseUrl: cfg.erpBaseUrl,
        apiKey: cfg.ecommerceApiKey,
        model: query.model,
        category: query.category,
      }),
    )
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
    return { items: [], source: "shop", error: null, taxonomy: emptyTaxonomy }
  } catch (err) {
    return {
      items: [],
      source: "shop",
      error: err instanceof Error ? err.message : "ERP no disponible",
      taxonomy: emptyTaxonomy,
    }
  }
}

/** Catalog used to price the cart. Shop products first; ERP only if the shop catalog is empty. */
export async function resolvePricedCatalog(model?: string): Promise<ErpCatalogItem[]> {
  return (await loadShopCatalog(model ? { model } : {})).items
}
