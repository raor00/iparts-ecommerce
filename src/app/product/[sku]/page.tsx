import Link from "next/link"
import { notFound } from "next/navigation"
import { shopConfig } from "@/lib/config"
import { availabilityLabel, fetchErpCatalog } from "@/lib/erp-stock"
import { readSession } from "@/lib/http"
import { selectOfferPrice } from "@/lib/vip-price"
import { AddToCart } from "@/components/add-to-cart"

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ sku: string }>
  searchParams: Promise<{ model?: string }>
}) {
  const { sku } = await params
  const { model } = await searchParams
  const session = await readSession()
  const cfg = shopConfig()
  const decoded = decodeURIComponent(sku)
  let items: Awaited<ReturnType<typeof fetchErpCatalog>> = []
  try {
    items = await fetchErpCatalog({ erpBaseUrl: cfg.erpBaseUrl, apiKey: cfg.ecommerceApiKey, model })
  } catch {
    items = []
  }
  const item = items.find((row) => row.sku === decoded)
  if (!item) notFound()
  const price = selectOfferPrice({ salePrice: item.salePrice, isVip: Boolean(session?.isVip) })
  return (
    <div>
      <p className="muted">
        <Link href="/">Catálogo</Link>
      </p>
      <article className="card">
        <h1>{item.fullName}</h1>
        <p className="muted">{item.category} · {item.models.join(", ")}</p>
        <p>SKU {item.sku}</p>
        <p>${price.unitPrice} {price.compareAt ? <s className="muted">${price.compareAt}</s> : null}</p>
        <p className="muted">{availabilityLabel(item)}</p>
        {session ? (
          <AddToCart sku={item.sku} name={item.fullName} unitPrice={price.unitPrice} disabled={!item.inStock} />
        ) : (
          <p>
            <Link className="btn" href={`/login?next=/product/${encodeURIComponent(item.sku)}`}>
              Inicia sesión para comprar
            </Link>
          </p>
        )}
      </article>
    </div>
  )
}
