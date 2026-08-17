"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PART_CATEGORIES } from "@/lib/catalog"

export function CategoryBar() {
  const path = usePathname()
  return (
    <nav className="catbar" aria-label="Categorías de repuesto">
      <div className="wrap catbar-row">
        {PART_CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/c/${cat.slug}`} aria-current={path === `/c/${cat.slug}` ? "page" : undefined}>
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
