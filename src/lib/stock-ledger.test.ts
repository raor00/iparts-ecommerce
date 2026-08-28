import { describe, expect, it } from "vitest"
import { applySale } from "./stock-ledger"

describe("stock ledger sale", () => {
  it("decrements when stock covers the order and rejects oversell", () => {
    expect(applySale(5, 3)).toEqual({ ok: true, newQty: 2 })
    expect(applySale(5, 10)).toEqual({ ok: false, available: 5 })
  })
})
