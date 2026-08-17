import Link from "next/link"
import { notFound } from "next/navigation"
import { modelSlug } from "@/lib/catalog"
import { availabilityLabel } from "@/lib/erp-stock"
import { readSession } from "@/lib/http"
import { loadShopCatalog } from "@/lib/load-catalog"
import { previewCatalog } from "@/lib/preview-catalog"
import { selectOfferPrice } from "@/lib/vip-price"
import { AddToCart } from "@/components/add-to-cart"
import { ProductPhoto } from "@/components/product-photo"

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
  const decoded = decodeURIComponent(sku)
  const loaded = await loadShopCatalog(model ? { model } : {})
  const item =
    loaded.items.find((row) => row.sku === decoded) ??
    previewCatalog().find((row) => row.sku === decoded)
  if (!item) notFound()
  const price = selectOfferPrice({ salePrice: item.salePrice, isVip: Boolean(session?.isVip) })
  return (
    <div>
      <p className="crumb">
        <Link href="/">Inicio</Link>
        {item.models[0] ? (
          <>
            {" / "}
            <Link href={`/catalog/${modelSlug(item.models[0]!)}`}>{item.models[0]}</Link>
          </>
        ) : null}
        {" / "}
        {item.category}
      </p>
      <article className="pdp">
        <div className="pdp-photo">
          <ProductPhoto category={item.category} brand={item.brand} alt={item.fullName} />
        </div>
        <div>
          <p className="kicker">{item.category}</p>
          <h1>{item.fullName}</h1>
          <p className="sku">
            SKU {item.sku}
            {item.quality ? ` · Calidad ${item.quality}` : ""}
            {item.brand ? ` · Marca ${item.brand}` : ""}
            {item.color ? ` · ${item.color}` : ""}
          </p>
          <div className="price-row" style={{ margin: "16px 0" }}>
            <span className="price">${price.unitPrice}</span>
            {price.compareAt ? <span className="was">${price.compareAt}</span> : null}
          </div>
          <p className={item.inStock ? "stock" : "stock out"}>{availabilityLabel(item)}</p>
          <p className="muted" style={{ margin: "12px 0 20px" }}>
            Compatible: {item.models.join(", ") || "—"}
            {session?.isVip ? " · Estás viendo precio VIP." : " · Precio de mostrador."}
          </p>
          {session ? (
            <AddToCart sku={item.sku} name={item.fullName} unitPrice={price.unitPrice} disabled={!item.inStock} />
          ) : (
            <Link className="btn" href={`/login?next=/product/${encodeURIComponent(item.sku)}`}>
              Entra para agregar al carrito
            </Link>
          )}
        </div>
      </article>
    </div>
  )
}
