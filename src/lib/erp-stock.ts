export type ErpCatalogItem = {
  sku: string
  fullName: string
  category: string
  models: string[]
  quantity: number
  salePrice: string
  inStock: boolean
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
    return {
      sku: item.sku,
      fullName: typeof item.fullName === "string" ? item.fullName : item.sku,
      category: typeof item.category === "string" ? item.category : "Repuesto",
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
  fetchImpl?: ErpFetch
}): Promise<ErpCatalogItem[]> {
  if (!input.erpBaseUrl) throw new Error("ERP_API_URL is not configured")
  if (!input.apiKey) throw new Error("ECOMMERCE_API_KEY is not configured")
  const url = new URL("/ecommerce/catalog", input.erpBaseUrl.replace(/\/$/, ""))
  if (input.model) url.searchParams.set("model", input.model)
  const fetchImpl = input.fetchImpl ?? (globalThis.fetch as unknown as ErpFetch)
  const res = await fetchImpl(url.toString(), {
    headers: { "X-Ecommerce-Key": input.apiKey, Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`ERP catalog HTTP ${res.status}`)
  return mapErpPayload(await res.json())
}

export function availabilityLabel(item: Pick<ErpCatalogItem, "quantity" | "inStock">): string {
  if (!item.inStock || item.quantity <= 0) return "Sin stock"
  return `${item.quantity} en stock`
}
