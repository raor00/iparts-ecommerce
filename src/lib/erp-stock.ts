export type ErpCatalogItem = {
  sku: string
  fullName: string
  category: string
  categorySlug: string
  brand: string | null
  quality: string | null
  qualityType: string | null
  color: string | null
  models: string[]
  quantity: number
  salePrice: string
  inStock: boolean
}

export type ErpTaxonomy = {
  categories: { name: string; slug: string }[]
  brands: string[]
  qualities: string[]
  models: string[]
}

export type ErpCatalogQuery = {
  model?: string
  category?: string
  brand?: string
  quality?: string
}

export type ErpFetch = (url: string, init: { headers: Record<string, string> }) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
}>

export function mapErpPayload(raw: unknown): ErpCatalogItem[] {
  if (!Array.isArray(raw)) throw new Error("ERP catalog payload must be an array")
  return raw.map((row) => {
    const item = row as Partial<ErpCatalogItem>
    if (typeof item.sku !== "string" || !item.sku) throw new Error("ERP item missing sku")
    const quantity = Number(item.quantity ?? 0)
    const category = typeof item.category === "string" ? item.category : "Repuesto"
    return {
      sku: item.sku,
      fullName: typeof item.fullName === "string" ? item.fullName : item.sku,
      category,
      categorySlug:
        typeof item.categorySlug === "string" && item.categorySlug
          ? item.categorySlug
          : category
              .normalize("NFD")
              .replace(/\p{M}/gu, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
      brand: typeof item.brand === "string" && item.brand ? item.brand : null,
      quality: typeof item.quality === "string" && item.quality ? item.quality : null,
      qualityType: typeof item.qualityType === "string" && item.qualityType ? item.qualityType : null,
      color: typeof item.color === "string" && item.color ? item.color : null,
      models: Array.isArray(item.models) ? item.models.filter((m): m is string => typeof m === "string") : [],
      quantity: Number.isFinite(quantity) ? quantity : 0,
      salePrice: Number(item.salePrice ?? 0).toFixed(2),
      inStock: quantity > 0,
    }
  })
}

export async function fetchErpCatalog(input: {
  erpBaseUrl: string
  apiKey: string
  model?: string
  category?: string
  brand?: string
  quality?: string
  fetchImpl?: ErpFetch
}): Promise<ErpCatalogItem[]> {
  if (!input.erpBaseUrl) throw new Error("ERP_API_URL is not configured")
  if (!input.apiKey) throw new Error("ECOMMERCE_API_KEY is not configured")
  const url = new URL("/ecommerce/catalog", input.erpBaseUrl.replace(/\/$/, ""))
  if (input.model) url.searchParams.set("model", input.model)
  if (input.category) url.searchParams.set("category", input.category)
  if (input.brand) url.searchParams.set("brand", input.brand)
  if (input.quality) url.searchParams.set("quality", input.quality)
  const fetchImpl = input.fetchImpl ?? (globalThis.fetch as unknown as ErpFetch)
  const res = await fetchImpl(url.toString(), {
    headers: { "X-Ecommerce-Key": input.apiKey, Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`ERP catalog HTTP ${res.status}`)
  return mapErpPayload(await res.json())
}

export async function fetchErpTaxonomy(input: {
  erpBaseUrl: string
  apiKey: string
  fetchImpl?: ErpFetch
}): Promise<ErpTaxonomy> {
  if (!input.erpBaseUrl) throw new Error("ERP_API_URL is not configured")
  if (!input.apiKey) throw new Error("ECOMMERCE_API_KEY is not configured")
  const url = new URL("/ecommerce/taxonomy", input.erpBaseUrl.replace(/\/$/, ""))
  const fetchImpl = input.fetchImpl ?? (globalThis.fetch as unknown as ErpFetch)
  const res = await fetchImpl(url.toString(), {
    headers: { "X-Ecommerce-Key": input.apiKey, Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`ERP taxonomy HTTP ${res.status}`)
  const raw = (await res.json()) as Partial<ErpTaxonomy>
  return {
    categories: Array.isArray(raw.categories)
      ? raw.categories.filter((row): row is { name: string; slug: string } =>
          Boolean(row && typeof row.name === "string" && typeof row.slug === "string"),
        )
      : [],
    brands: Array.isArray(raw.brands) ? raw.brands.filter((row): row is string => typeof row === "string") : [],
    qualities: Array.isArray(raw.qualities) ? raw.qualities.filter((row): row is string => typeof row === "string") : [],
    models: Array.isArray(raw.models) ? raw.models.filter((row): row is string => typeof row === "string") : [],
  }
}

export function availabilityLabel(item: Pick<ErpCatalogItem, "quantity" | "inStock">): string {
  if (!item.inStock || item.quantity <= 0) return "Sin stock"
  return `${item.quantity} en stock`
}
