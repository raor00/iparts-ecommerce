import { brandInitials } from "@/lib/brand-mark"
import { partImageSrc } from "@/lib/part-visual"

export function ProductPhoto({
  category,
  brand,
  alt,
  className = "",
}: {
  category: string
  brand?: string | null
  alt: string
  className?: string
}) {
  return (
    <div className={`photo ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={partImageSrc(category)} alt={alt} />
      <span className="wm" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wm-logo" src="/brand/iparts-logo.png" alt="" />
        IPARTS
      </span>
      {brand ? (
        <span className="brand-seal" title={brand}>
          <span>{brandInitials(brand)}</span>
          <small>{brand}</small>
        </span>
      ) : null}
    </div>
  )
}
