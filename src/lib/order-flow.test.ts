import { describe, expect, it } from "vitest"
import { addShopProduct } from "./shop-catalog"
import { applyPaidSettlement, confirmManualPayment, ownerKpis } from "./order-flow"
import { addOrder, loadDb, type Db } from "./store"
import { emptyProfile } from "./profile"

function db(): Db {
  return loadDb("/does-not-exist-order-flow.json")
}

function seedStock(store: Db) {
  addShopProduct(store, {
    categorySlug: "pantallas",
    model: "iPhone 16 Pro Max",
    brand: "JK",
    quality: "OLED",
    wholesalePrice: 185,
    quantity: 5,
  })
}

describe("paid settlement", () => {
  it("decrements inventory and credits the owner wallet only when the order is settled", () => {
    const store = db()
    seedStock(store)
    const awaiting = addOrder(store, {
      userId: "u1",
      status: "awaiting_payment",
      total: "100.00",
      paymentRef: "zelle_ANA",
      paymentMethod: "zelle",
      ownerFee: "2.50",
      dispatchStatus: "none",
      shippingSnapshot: emptyProfile(),
      lines: [{ sku: "PANT-OLED-JK-16PROMAX", name: "Pantalla", quantity: 2, unitPrice: "50.00" }],
    })
    expect(store.stock["PANT-OLED-JK-16PROMAX"]).toBe(5)
    expect(store.ownerWallet.balance).toBe("0.00")

    const settled = confirmManualPayment(store, awaiting.id)
    expect(settled.status).toBe("ready_to_pack")
    expect(store.stock["PANT-OLED-JK-16PROMAX"]).toBe(3)
    expect(store.ownerWallet.balance).toBe("2.50")
    expect(() => confirmManualPayment(store, awaiting.id)).toThrow(/espera confirmación/)
  })

  it("applyPaidSettlement reduces stock for an already-created paid order", () => {
    const store = db()
    seedStock(store)
    const order = addOrder(store, {
      userId: "u1",
      status: "ready_to_pack",
      total: "50.00",
      paymentRef: "binance_x",
      paymentMethod: "binance_pay",
      ownerFee: "1.25",
      dispatchStatus: "ready_to_pack",
      lines: [{ sku: "PANT-OLED-JK-16PROMAX", name: "Pantalla", quantity: 1, unitPrice: "50.00" }],
    })
    applyPaidSettlement(store, order)
    expect(store.stock["PANT-OLED-JK-16PROMAX"]).toBe(4)
    expect(store.ownerWallet.balance).toBe("1.25")
  })
})

describe("ownerKpis", () => {
  it("counts collected revenue, shipped orders and top products from real orders", () => {
    const store = db()
    addOrder(store, {
      userId: "u1",
      status: "ready_to_pack",
      total: "100.00",
      paymentRef: "a",
      lines: [{ sku: "PANT-A", name: "Pantalla A", quantity: 3, unitPrice: "10.00" }],
    })
    addOrder(store, {
      userId: "u1",
      status: "shipped",
      total: "50.00",
      paymentRef: "b",
      dispatchStatus: "shipped",
      lines: [{ sku: "PANT-A", name: "Pantalla A", quantity: 1, unitPrice: "10.00" }],
    })
    addOrder(store, {
      userId: "u2",
      status: "awaiting_payment",
      total: "9.00",
      paymentRef: "c",
      lines: [{ sku: "BAT-B", name: "Batería", quantity: 9, unitPrice: "1.00" }],
    })
    const kpi = ownerKpis(store)
    expect(kpi.orderCount).toBe(3)
    expect(kpi.collectedCount).toBe(2)
    expect(kpi.shippedCount).toBe(1)
    expect(kpi.revenue).toBe("150.00")
    expect(kpi.topProducts[0]).toEqual({ sku: "PANT-A", name: "Pantalla A", quantity: 4 })
  })
})
