import Link from "next/link"
import { availabilityLabel } from "@/lib/erp-stock"
import { selectOfferPrice } from "@/lib/vip-price"
import type { ErpCatalogItem } from "@/lib/erp-stock"
import { ProductPhoto } from "@/components/product-photo"
import { ProductBuyBox } from "@/components/product-buy-box"
import { partImageHint } from "@/lib/part-visual"
import { productCopy } from "@/lib/product-copy"
import { isPreviewSku } from "@/lib/preview-catalog"

export function ProductCard({
  item,
  isVip,
  href,
}: {
  item: ErpCatalogItem
  isVip: boolean
  href: string
}) {
  const price = selectOfferPrice({ salePrice: item.salePrice, isVip })
  const copy = productCopy(item)
  return (
    <article className="pcard">
      <Link className="well" href={href}>
        <ProductPhoto
          category={partImageHint(item)}
          brand={item.brand}
          modelShort={copy.modelShort}
          quality={copy.technology ?? copy.origin}
          alt={copy.title}
        />
      </Link>
      <div className="meta">
        <Link href={href}>
          <h3>{copy.title}</h3>
        </Link>
        {copy.chips.length > 0 ? (
          <p className="id-line">
            {copy.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </p>
        ) : null}
        {!isPreviewSku(item.sku) ? <p className="sku-line">Código {item.sku}</p> : null}
        <div className="price-row">
          <span className="price">${price.unitPrice}</span>
          {price.compareAt ? <span className="was">${price.compareAt}</span> : null}
        </div>
        <span className={item.inStock ? "stock" : "stock out"}>{availabilityLabel(item)}</span>
        <ProductBuyBox sku={item.sku} maxQty={99} disabled={!item.inStock} compact />
      </div>
    </article>
  )
}
