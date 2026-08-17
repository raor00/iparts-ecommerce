import { shopConfig } from "@/lib/config"
import { fetchErpCatalog } from "@/lib/erp-stock"
import { json } from "@/lib/http"

export async function GET(req: Request) {
  const model = new URL(req.url).searchParams.get("model") ?? undefined
  const cfg = shopConfig()
  try {
    const items = await fetchErpCatalog({
      erpBaseUrl: cfg.erpBaseUrl,
      apiKey: cfg.ecommerceApiKey,
      model,
    })
    return json({ items })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "ERP no disponible", items: [] }, 502)
  }
}
