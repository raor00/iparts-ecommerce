export type CartLine = {
  sku: string
  name: string
  quantity: number
  unitPrice: string
}

export type Cart = {
  lines: CartLine[]
}

export function emptyCart(): Cart {
  return { lines: [] }
}

export function addCartLine(cart: Cart, line: Omit<CartLine, "quantity"> & { quantity?: number }): Cart {
  const qty = Math.max(1, Math.floor(line.quantity ?? 1))
  const existing = cart.lines.find((row) => row.sku === line.sku)
  if (!existing) {
    return { lines: [...cart.lines, { sku: line.sku, name: line.name, quantity: qty, unitPrice: line.unitPrice }] }
  }
  return {
    lines: cart.lines.map((row) =>
      row.sku === line.sku ? { ...row, quantity: row.quantity + qty, unitPrice: line.unitPrice, name: line.name } : row,
    ),
  }
}

export function setCartLineQty(cart: Cart, sku: string, quantity: number): Cart {
  const qty = Math.floor(quantity)
  if (qty <= 0) return { lines: cart.lines.filter((row) => row.sku !== sku) }
  return {
    lines: cart.lines.map((row) => (row.sku === sku ? { ...row, quantity: qty } : row)),
  }
}

export function cartSubtotal(cart: Cart): string {
  const cents = cart.lines.reduce((sum, line) => sum + Math.round(Number(line.unitPrice) * 100) * line.quantity, 0)
  return (cents / 100).toFixed(2)
}
