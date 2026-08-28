const KNOWN_MAKER_LOGOS: Record<string, string> = {
  jk: "/brand/makers/jk.png",
  gx: "/brand/makers/gx.png",
  zy: "/brand/makers/zy.png",
  oem: "/brand/makers/oem.svg",
  amp: "/brand/makers/amp.svg",
}

export function brandSlug(brand: string): string {
  return brand
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function brandInitials(brand: string): string {
  const cleaned = brand.trim()
  if (!cleaned) return "IP"
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return cleaned.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}

/** Official maker mark for the product photo. Null means fall back to plain letters. */
export function brandLogoSrc(brand: string | null | undefined): string | null {
  if (!brand?.trim()) return null
  return KNOWN_MAKER_LOGOS[brandSlug(brand)] ?? null
}
