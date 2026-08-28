import { brandInitials, brandLogoSrc } from "@/lib/brand-mark"
import { partImageSrc } from "@/lib/part-visual"

export function ProductPhoto({
  category,
  brand,
  alt,
  modelShort,
  quality,
  className = "",
}: {
  category: string
  brand?: string | null
  alt: string
  modelShort?: string | null
  quality?: string | null
  className?: string
}) {
  const makerSrc = brandLogoSrc(brand)
  return (
    <div className={`photo ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={partImageSrc(category)} alt={alt} />
      <span className="wm" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wm-logo wm-dark" src="/brand/iparts-logo.png" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wm-logo wm-light" src="/brand/iparts-logo.png" alt="" />
      </span>
      {makerSrc ? (
        <span className="maker-badge" title={brand ?? undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={makerSrc} alt="" />
        </span>
      ) : brand ? (
        <span className="maker-badge" title={brand}>
          <span className="maker-word">{brandInitials(brand)}</span>
        </span>
      ) : null}
      {modelShort ? <span className="model-chip">{modelShort}</span> : null}
      {quality ? <span className="quality-ribbon">{quality}</span> : null}
    </div>
  )
}
