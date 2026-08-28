export type StockMovement = {
  id: string
  createdAt: string
  sku: string
  type: "SALE" | "ADJUST" | "RESERVE" | "RELEASE"
  qty: number
  prevQty: number
  newQty: number
  refType: string
  refId: string
  userId: string | null
}

export function applySale(qty: number, requested: number): { ok: true; newQty: number } | { ok: false; available: number } {
  if (requested <= 0) return { ok: false, available: qty }
  if (requested > qty) return { ok: false, available: qty }
  return { ok: true, newQty: qty - requested }
}
