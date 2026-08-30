import { describe, expect, it } from "vitest"
import { addOrder, loadDb, setDispatchStatus } from "./store"

describe("setDispatchStatus", () => {
  it("moves a collected order packed then shipped and rejects awaiting_payment", () => {
    const db = loadDb("/does-not-exist-dispatch-status.json")
    const ready = addOrder(db, {
      userId: "u1",
      status: "ready_to_pack",
      total: "10.00",
      paymentRef: "ref",
      dispatchStatus: "ready_to_pack",
      lines: [{ sku: "PANT-A", name: "Pantalla", quantity: 1, unitPrice: "10.00" }],
    })
    const packed = setDispatchStatus(db, ready.id, "packed")
    expect(packed.status).toBe("packed")
    expect(packed.dispatchStatus).toBe("packed")
    const shipped = setDispatchStatus(db, ready.id, "shipped")
    expect(shipped.status).toBe("shipped")
    expect(shipped.dispatchStatus).toBe("shipped")

    const waiting = addOrder(db, {
      userId: "u1",
      status: "awaiting_payment",
      total: "10.00",
      paymentRef: "zelle_x",
      dispatchStatus: "none",
      lines: [{ sku: "PANT-A", name: "Pantalla", quantity: 1, unitPrice: "10.00" }],
    })
    expect(() => setDispatchStatus(db, waiting.id, "packed")).toThrow(/cobrado/)
  })
})
