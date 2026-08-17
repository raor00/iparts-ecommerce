import Link from "next/link"
import { notFound } from "next/navigation"
import { modelFromSlug } from "@/lib/catalog"
import { shopConfig } from "@/lib/config"
import { availabilityLabel, fetchErpCatalog } from "@/lib/erp-stock"
import { selectOfferPrice } from "@/lib/vip-price"
import { readSession } from "@/lib/http"

export default async function CatalogModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model: slug } = await params
  const model = modelFromSlug(slug)
  if (!model) notFound()
  const session = await readSession()
  const cfg = shopConfig()
  let items: Awaited<ReturnType<typeof fetchErpCatalog>> = []
  let erpError: string | null = null
  try {
    items = await fetchErpCatalog({ erpBaseUrl: cfg.erpBaseUrl, apiKey: cfg.ecommerceApiKey, model })
  } catch (err) {
    erpError = err instanceof Error ? err.message : "ERP no disponible"
  }
  return (
    <div>
      <p className="muted">
        <Link href="/">Catálogo</Link> / {model}
      </p>
      <h1>{model}</h1>
      <p className="muted">
        Precios {session?.isVip ? "VIP (mayorista)" : "de mostrador"}. Stock leído del ERP.
      </p>
      {erpError && <p className="muted">ERP: {erpError}</p>}
      <div className="grid">
        {items.map((item) => {
          const price = selectOfferPrice({ salePrice: item.salePrice, isVip: Boolean(session?.isVip) })
          return (
            <Link key={item.sku} className="card" href={`/product/${encodeURIComponent(item.sku)}?model=${slug}`}>
              <h3>{item.fullName}</h3>
              <p className="muted">{item.category}</p>
              <p>${price.unitPrice}</p>
              <p className="muted">{availabilityLabel(item)}</p>
            </Link>
          )
        })}
        {items.length === 0 && !erpError && <p className="muted">Sin SKUs para este modelo en el ERP.</p>}
      </div>
    </div>
  )
}
