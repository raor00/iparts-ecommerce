import { selectOfferPrice } from "./vip-price"
import type { Cart, CartLine } from "./cart"
import type { ErpCatalogItem } from "./erp-stock"

export function findCatalogItem(catalog: ErpCatalogItem[], sku: string): ErpCatalogItem | undefined {
  return catalog.find((item) => item.sku === sku)
}

/** Server price for a SKU. Ignores any client-posted unitPrice. */
export function pricedCartAdd(input: {
  sku: string
  clientUnitPrice?: string
  quantity?: number
  catalog: ErpCatalogItem[]
  isVip: boolean
}): CartLine {
  const item = findCatalogItem(input.catalog, input.sku)
  if (!item) throw new Error(`SKU ${input.sku} no está en el catálogo ERP`)
  const offer = selectOfferPrice({ salePrice: item.salePrice, isVip: input.isVip })
  return {
    sku: item.sku,
    name: item.fullName,
    quantity: Math.max(1, Math.floor(input.quantity ?? 1)),
    unitPrice: offer.unitPrice,
  }
}

/** Recompute every line from live ERP + VIP before charging. */
export function repriceCart(cart: Cart, catalog: ErpCatalogItem[], isVip: boolean): Cart {
  return {
    lines: cart.lines.map((line) => {
      const priced = pricedCartAdd({
        sku: line.sku,
        clientUnitPrice: line.unitPrice,
        quantity: line.quantity,
        catalog,
        isVip,
      })
      return { ...priced, quantity: line.quantity }
    }),
  }
}
