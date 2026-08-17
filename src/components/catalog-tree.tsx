import Link from "next/link"
import { PART_CATEGORIES, modelsBySeries } from "@/lib/catalog"
import type { ErpTaxonomy } from "@/lib/erp-stock"

function hrefFor(slug: string, next: { model?: string; brand?: string; quality?: string }) {
  const params = new URLSearchParams()
  if (next.model) params.set("model", next.model)
  if (next.brand) params.set("brand", next.brand)
  if (next.quality) params.set("quality", next.quality)
  const q = params.toString()
  return q ? `/c/${slug}?${q}` : `/c/${slug}`
}

export function CatalogTree({
  slug,
  filters,
  taxonomy,
}: {
  slug: string
  filters: { model?: string; brand?: string; quality?: string }
  taxonomy: ErpTaxonomy
}) {
  const series = modelsBySeries().filter((group) =>
    group.models.some((model) => taxonomy.models.includes(model)),
  )
  return (
    <aside className="tree" aria-label="Categorías y subcategorías">
      <p className="tree-kicker">Posición</p>
      <nav>
        <p className="tree-h">Categorías</p>
        <ul className="tree-list">
          {PART_CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                className="tree-link"
                href={`/c/${cat.slug}`}
                aria-current={cat.slug === slug && !filters.model && !filters.quality && !filters.brand ? "page" : undefined}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav>
        <p className="tree-h">Modelo</p>
        {series.map((group) => (
          <div key={group.series} className="tree-sub">
            <p className="tree-subh">Serie {group.series}</p>
            <ul className="tree-list">
              {group.models
                .filter((model) => taxonomy.models.includes(model))
                .map((model) => (
                  <li key={model}>
                    <Link
                      className="tree-link"
                      href={hrefFor(slug, { model, brand: filters.brand, quality: filters.quality })}
                      aria-current={filters.model === model ? "page" : undefined}
                    >
                      {model.replace(/^iPhone\s+/, "")}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {filters.model && (
          <Link className="tree-clear" href={hrefFor(slug, { brand: filters.brand, quality: filters.quality })}>
            Quitar modelo
          </Link>
        )}
      </nav>
      <nav>
        <p className="tree-h">Calidad</p>
        <ul className="tree-list">
          {taxonomy.qualities.map((quality) => (
            <li key={quality}>
              <Link
                className="tree-link"
                href={hrefFor(slug, { model: filters.model, brand: filters.brand, quality })}
                aria-current={filters.quality === quality ? "page" : undefined}
              >
                {quality}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav>
        <p className="tree-h">Marca</p>
        <ul className="tree-list">
          {taxonomy.brands.map((brand) => (
            <li key={brand}>
              <Link
                className="tree-link"
                href={hrefFor(slug, { model: filters.model, brand, quality: filters.quality })}
                aria-current={filters.brand === brand ? "page" : undefined}
              >
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
