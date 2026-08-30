import { creditOwnerWallet, decrementSale, type Db, type ShopOrder } from "./store"

const COLLECTED = new Set(["paid", "ready_to_pack", "packed", "shipped"])

export function applyPaidSettlement(db: Db, order: ShopOrder): void {
  decrementSale(db, order.lines, order.id, order.userId)
  if (order.ownerFee) {
    creditOwnerWallet(db, {
      orderId: order.id,
      amount: order.ownerFee,
      note: `Pasarela ${order.paymentMethod ?? ""}`,
    })
  }
}

export function confirmManualPayment(db: Db, orderId: string): ShopOrder {
  const order = db.orders.find((row) => row.id === orderId)
  if (!order) throw new Error("Pedido no encontrado")
  if (order.status !== "awaiting_payment") throw new Error("El pedido no espera confirmación")
  applyPaidSettlement(db, order)
  order.status = "ready_to_pack"
  order.dispatchStatus = "ready_to_pack"
  return order
}

export function ownerKpis(db: Db): {
  orderCount: number
  collectedCount: number
  shippedCount: number
  revenue: string
  walletBalance: string
  topProducts: { sku: string; name: string; quantity: number }[]
} {
  const collected = db.orders.filter((row) => COLLECTED.has(row.status))
  const shipped = db.orders.filter((row) => row.status === "shipped" || row.dispatchStatus === "shipped")
  const cents = collected.reduce((sum, row) => sum + Math.round(Number(row.total) * 100 || 0), 0)
  const qty = new Map<string, { sku: string; name: string; quantity: number }>()
  for (const order of collected) {
    for (const line of order.lines) {
      const prev = qty.get(line.sku) ?? { sku: line.sku, name: line.name, quantity: 0 }
      prev.quantity += line.quantity
      qty.set(line.sku, prev)
    }
  }
  return {
    orderCount: db.orders.length,
    collectedCount: collected.length,
    shippedCount: shipped.length,
    revenue: (cents / 100).toFixed(2),
    walletBalance: db.ownerWallet.balance,
    topProducts: [...qty.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 8),
  }
}
