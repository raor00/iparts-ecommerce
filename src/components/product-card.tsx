import Link from "next/link"
import { availabilityLabel } from "@/lib/erp-stock"
import { selectOfferPrice } from "@/lib/vip-price"
import type { ErpCatalogItem } from "@/lib/erp-stock"
import { ProductPhoto } from "@/components/product-photo"

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
  return (
    <Link className="pcard" href={href}>
      <div className="well">
        <span className="badge">{item.category}</span>
        <ProductPhoto category={item.qualityType || item.category} brand={item.brand} alt="" />
      </div>
      <div className="meta">
        <h3>{item.fullName}</h3>
        <p className="sku-line">
          SKU {item.sku}
          {item.quality ? ` · ${item.quality}` : ""}
          {item.brand ? ` · ${item.brand}` : ""}
        </p>
        <div className="price-row">
          <span className="price">${price.unitPrice}</span>
          {price.compareAt ? <span className="was">${price.compareAt}</span> : null}
        </div>
        <span className={item.inStock ? "stock" : "stock out"}>{availabilityLabel(item)}</span>
      </div>
    </Link>
  )
}
