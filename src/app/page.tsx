import Link from "next/link"
import { PART_CATEGORIES, modelSlug, modelsBySeries } from "@/lib/catalog"

export default function HomePage() {
  const groups = modelsBySeries()
  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Almacén IPARTS · mayorista</p>
          <h1>Repuestos iPhone, del mostrador al pedido.</h1>
          <p>
            Pantallas, baterías, tapas y flex desde iPhone XR hasta 17 Pro Max. Precio de
            mostrador o VIP. El stock lo lee el ERP, no un catálogo inventado.
          </p>
          <Link className="btn" href="/catalog/16-pro-max">
            Ver iPhone 16 Pro Max
          </Link>
        </div>
        <div className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/parts/hero.jpg" alt="Repuestos iPhone en el mostrador" />
        </div>
      </section>

      <div className="section-h">
        <h2>Categorías</h2>
        <span>Elige el tipo de pieza</span>
      </div>
      <div className="grid">
        {PART_CATEGORIES.map((cat) => (
          <Link key={cat.slug} className="cat-card" href={`/c/${cat.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/parts/${cat.slug}.jpg`} alt="" />
            <div className="pad">
              <h3>{cat.name}</h3>
              <p className="muted">Por modelo XR–17 Pro Max</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-h" style={{ marginTop: 28 }}>
        <h2>Modelos</h2>
        <span>Serie completa</span>
      </div>
      {groups.map((group) => (
        <section key={group.series} style={{ marginBottom: 22 }}>
          <p className="kicker" style={{ marginBottom: 10 }}>
            Serie {group.series}
          </p>
          <div className="grid">
            {group.models.map((model) => (
              <Link key={model} className="model-card" href={`/catalog/${modelSlug(model)}`}>
                <div className="ph">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/parts/pantallas.jpg" alt="" />
                </div>
                <div className="pad">
                  <h3>{model}</h3>
                  <p className="muted">Ver repuestos</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
