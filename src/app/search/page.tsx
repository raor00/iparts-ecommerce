import Link from "next/link"
import { modelSlug } from "@/lib/catalog"
import { readSession } from "@/lib/http"
import { loadShopCatalog } from "@/lib/load-catalog"
import { ProductCard } from "@/components/product-card"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams
  const query = q.trim().toLowerCase()
  const session = await readSession()
  const loaded = await loadShopCatalog()
  const tokens = query.split(/\s+/).filter(Boolean)
  const items = tokens.length
    ? loaded.items.filter((item) => {
        const hay = `${item.fullName} ${item.category} ${item.sku} ${item.models.join(" ")}`.toLowerCase()
        return tokens.every((token) => hay.includes(token))
      })
    : []
  return (
    <div>
      <p className="crumb">
        <Link href="/">Inicio</Link> / Búsqueda
      </p>
      <h1 className="page-title">{query ? `Resultados para “${q.trim()}”` : "Buscar repuestos"}</h1>
      <p className="muted">{query ? `${items.length} piezas` : "Escribe pantalla, batería o un modelo."}</p>
      <div className="grid products">
        {items.slice(0, 48).map((item) => (
          <ProductCard
            key={item.sku}
            item={item}
            isVip={Boolean(session?.isVip)}
            href={`/product/${encodeURIComponent(item.sku)}?model=${modelSlug(item.models[0] ?? "")}`}
          />
        ))}
      </div>
    </div>
  )
}
