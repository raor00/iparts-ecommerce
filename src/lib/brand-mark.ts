export function brandInitials(brand: string): string {
  const cleaned = brand.trim()
  if (!cleaned) return "IP"
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return cleaned.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
}
