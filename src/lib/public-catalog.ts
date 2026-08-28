import type { ErpCatalogItem } from "./erp-stock"

export type PublicCatalogItem = Omit<ErpCatalogItem, "quantity"> & { inStock: boolean }

export function toPublicCatalogItem(item: ErpCatalogItem): PublicCatalogItem {
  const { quantity: _qty, ...rest } = item
  return { ...rest, inStock: item.inStock && item.quantity > 0 }
}

export function qtyCapError(available: number): { code: "QTY_CAP"; max: number; error: string } {
  const max = Math.max(0, Math.floor(available))
  return {
    code: "QTY_CAP",
    max,
    error: max <= 0 ? "Sin stock" : `Solo puedes pedir hasta ${max} unidades`,
  }
}
