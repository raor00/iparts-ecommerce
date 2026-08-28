import Link from "next/link"
import { notFound } from "next/navigation"
import { modelSlug } from "@/lib/catalog"
import { availabilityLabel } from "@/lib/erp-stock"
import { readSession } from "@/lib/http"
import { loadShopCatalog } from "@/lib/load-catalog"
import { isPreviewSku, previewCatalog } from "@/lib/preview-catalog"
import { selectOfferPrice } from "@/lib/vip-price"
import { ProductBuyBox } from "@/components/product-buy-box"
import { ProductPhoto } from "@/components/product-photo"
import { partImageHint } from "@/lib/part-visual"
import { productCopy } from "@/lib/product-copy"

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
  const copy = productCopy(item)
  return (
    <div>
      <p className="crumb">
        <Link href="/">Inicio</Link>
        {copy.model ? (
          <>
            {" / "}
            <Link href={`/catalog/${modelSlug(copy.model)}`}>{copy.model}</Link>
          </>
        ) : null}
        {" / "}
        {copy.kind}
      </p>
      <article className="pdp">
        <div className="pdp-photo">
          <ProductPhoto
            category={partImageHint(item)}
            brand={item.brand}
            modelShort={copy.modelShort}
            quality={copy.technology ?? copy.origin}
            alt={copy.title}
          />
        </div>
        <div>
          <p className="kicker">{copy.kind}</p>
          <h1>{copy.title}</h1>
          {copy.chips.length > 0 ? (
            <p className="id-line" style={{ margin: "8px 0 0" }}>
              {copy.chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </p>
          ) : null}
          {!isPreviewSku(item.sku) ? <p className="sku">Código {item.sku}</p> : null}
          <div className="price-row" style={{ margin: "16px 0" }}>
            <span className="price">${price.unitPrice}</span>
            {price.compareAt ? <span className="was">${price.compareAt}</span> : null}
          </div>
          <p className={item.inStock ? "stock" : "stock out"}>{availabilityLabel(item)}</p>
          <p className="muted" style={{ margin: "12px 0 20px" }}>
            Compatible: {item.models.join(", ") || "—"}
            {session?.isVip ? " · Estás viendo precio VIP." : " · Precio de mostrador."}
          </p>
          <ProductBuyBox sku={item.sku} maxQty={99} disabled={!item.inStock} />
        </div>
      </article>
    </div>
  )
}
