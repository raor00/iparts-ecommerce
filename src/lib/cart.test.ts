import { describe, expect, it } from "vitest"
import { addCartLine, cartCount, cartSubtotal, clampQty, emptyCart, mergeCarts, setCartLineQty } from "./cart"

describe("cart", () => {
  it("adds, merges the same SKU, updates qty and totals from line prices", () => {
    let cart = emptyCart()
    cart = addCartLine(cart, { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 2 })
    cart = addCartLine(cart, { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 1 })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]!.quantity).toBe(3)
    expect(cartSubtotal(cart)).toBe("30.00")
    expect(cartCount(cart)).toBe(3)
    cart = setCartLineQty(cart, "A", 1)
    expect(cartSubtotal(cart)).toBe("10.00")
    cart = setCartLineQty(cart, "A", 0)
    expect(cart.lines).toHaveLength(0)
  })

  it("merges a guest cart into the account cart and clamps qty to stock", () => {
    const user = addCartLine(emptyCart(), { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 1 })
    const guest = addCartLine(emptyCart(), { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 2 })
    expect(mergeCarts(user, guest).lines[0]!.quantity).toBe(3)
    expect(clampQty(8, 6)).toBe(6)
    expect(clampQty(0, 6)).toBe(1)
    expect(clampQty(2, 0)).toBe(0)
  })
})
