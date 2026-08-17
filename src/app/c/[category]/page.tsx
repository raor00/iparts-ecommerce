import Link from "next/link"
import { notFound } from "next/navigation"
import { PART_CATEGORIES, modelSlug } from "@/lib/catalog"
import { readSession } from "@/lib/http"
import { loadShopCatalog } from "@/lib/load-catalog"
import { positionCrumbs, positionHeading } from "@/lib/position-title"
import { CatalogTree } from "@/components/catalog-tree"
import { ProductCard } from "@/components/product-card"

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ model?: string; brand?: string; quality?: string }>
}) {
  const { category } = await params
  const filters = await searchParams
  const cat = PART_CATEGORIES.find((row) => row.slug === category)
  if (!cat) notFound()
  const session = await readSession()
  const model = filters.model ?? (cat.slug === "original-usada" ? "iPhone 11" : undefined)
  const quality = filters.quality ?? (cat.slug === "original-usada" ? "Original usada" : undefined)
  const loaded = await loadShopCatalog({
    category: cat.slug,
    model,
    brand: filters.brand,
    quality: cat.slug === "original-usada" ? quality : filters.quality,
  })
  const pos = {
    category: cat.name,
    model,
    quality,
    brand: filters.brand,
  }
  const crumbs = positionCrumbs(pos)
  const heading = positionHeading(pos)
  return (
    <div className="shop-floor">
      <CatalogTree slug={cat.slug} filters={{ ...filters, model, quality }} taxonomy={loaded.taxonomy} />
      <div>
        <nav className="crumb" aria-label="Posición en el catálogo">
          <Link href="/">Inicio</Link>
          <span> / </span>
          <Link href="/">Repuestos</Link>
          {crumbs.map((crumb, i) => (
            <span key={crumb.key}>
              {" / "}
              {i === crumbs.length - 1 ? <strong>{crumb.label}</strong> : crumb.label}
            </span>
          ))}
        </nav>
        <p className="kicker">
          {cat.name}
          {filters.model ? ` · ${filters.model}` : ""}
          {filters.quality ? ` · ${filters.quality}` : ""}
          {filters.brand ? ` · ${filters.brand}` : ""}
        </p>
        <h1 className="page-title">{heading}</h1>
        <p className="muted">
          {loaded.items.length} SKU
          {loaded.source === "erp" ? " en almacén." : " de referencia."}
        </p>
        {loaded.source === "preview" && (
          <p className="banner">ERP no conectado — lista de muestra. El árbol de la izquierda es categoría / modelo / calidad / marca.</p>
        )}
        <div className="grid products">
          {loaded.items.slice(0, 80).map((item) => (
            <ProductCard
              key={item.sku}
              item={item}
              isVip={Boolean(session?.isVip)}
              href={`/product/${encodeURIComponent(item.sku)}?model=${modelSlug(item.models[0] ?? "")}`}
            />
          ))}
        </div>
        {loaded.items.length === 0 && <p className="muted">No hay SKUs en esta posición del catálogo.</p>}
      </div>
    </div>
  )
}
