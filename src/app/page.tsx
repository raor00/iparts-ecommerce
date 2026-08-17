import Link from "next/link"
import { PART_CATEGORIES, modelSlug, modelsBySeries } from "@/lib/catalog"

export default function HomePage() {
  const groups = modelsBySeries()
  return (
    <div>
      <h1>Repuestos iPhone</h1>
      <p className="muted">XR → 17 Pro Max. Stock en vivo desde el ERP IPARTS.</p>
      <h2>Categorías</h2>
      <div className="grid">
        {PART_CATEGORIES.map((cat) => (
          <article key={cat.slug} className="card">
            <h3>{cat.name}</h3>
            <p className="muted">Compatible por modelo</p>
          </article>
        ))}
      </div>
      <h2>Modelos</h2>
      {groups.map((group) => (
        <section key={group.series}>
          <h3>Serie {group.series}</h3>
          <div className="grid">
            {group.models.map((model) => (
              <Link key={model} className="card" href={`/catalog/${modelSlug(model)}`}>
                <h3>{model}</h3>
                <p className="muted">Ver repuestos</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
