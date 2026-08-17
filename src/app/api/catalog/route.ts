import { json } from "@/lib/http"
import { loadShopCatalog } from "@/lib/load-catalog"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const loaded = await loadShopCatalog({
    ...(url.searchParams.get("model") ? { model: url.searchParams.get("model")! } : {}),
    ...(url.searchParams.get("category") ? { category: url.searchParams.get("category")! } : {}),
    ...(url.searchParams.get("brand") ? { brand: url.searchParams.get("brand")! } : {}),
    ...(url.searchParams.get("quality") ? { quality: url.searchParams.get("quality")! } : {}),
  })
  return json({
    items: loaded.items,
    source: loaded.source,
    error: loaded.error,
    taxonomy: loaded.taxonomy,
  })
}
