import Link from "next/link"

export function FacetBar({
  label,
  allHref,
  active,
  options,
}: {
  label: string
  allHref: string
  active?: string
  options: { href: string; label: string; value: string }[]
}) {
  if (options.length === 0) return null
  return (
    <div className="facet">
      <p className="facet-label">{label}</p>
      <div className="toolbar">
        <Link className="chip" href={allHref} aria-current={!active ? "page" : undefined}>
          Todas
        </Link>
        {options.map((opt) => (
          <Link
            key={opt.value}
            className="chip"
            href={opt.href}
            aria-current={active === opt.value ? "page" : undefined}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
