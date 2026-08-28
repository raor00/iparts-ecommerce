"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { PART_CATEGORIES, modelsBySeries } from "@/lib/catalog"
import { shortModelLabel } from "@/lib/product-copy"

const SERIES = modelsBySeries()

export function CategoryBar() {
  const path = usePathname()
  const [open, setOpen] = useState<string | null>(null)
  const current = PART_CATEGORIES.find((cat) => cat.slug === open)

  return (
    <nav
      className="catbar"
      aria-label="Categorías de repuesto"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="wrap catbar-row">
        {PART_CATEGORIES.map((cat) => {
          const active = path === `/c/${cat.slug}`
          const shown = open === cat.slug
          return (
            <div
              key={cat.slug}
              className={`cat-item${shown ? " open" : ""}`}
              onMouseEnter={() => setOpen(cat.slug)}
            >
              <Link href={`/c/${cat.slug}`} aria-current={active ? "page" : undefined} aria-expanded={shown}>
                {cat.name}
              </Link>
            </div>
          )
        })}
      </div>
      {current ? (
        <div className="cat-mega" role="region" aria-label={`Modelos de ${current.name}`}>
          <div className="wrap">
            <div className="cat-mega-head">
              <p>
                {current.name} <span>por modelo</span>
              </p>
              <Link href={`/c/${current.slug}`}>Ver todas</Link>
            </div>
            <div className="cat-mega-grid">
              {SERIES.map((group) => (
                <div key={group.series} className="cat-mega-col">
                  <p>Serie {group.series}</p>
                  {group.models.map((model) => (
                    <Link key={model} href={`/c/${current.slug}?model=${encodeURIComponent(model)}`}>
                      {shortModelLabel(model)}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  )
}
