import { describe, expect, it } from "vitest"
import { addCartLine, cartSubtotal, emptyCart, setCartLineQty } from "./cart"

describe("cart", () => {
  it("adds, merges the same SKU, updates qty and totals from line prices", () => {
    let cart = emptyCart()
    cart = addCartLine(cart, { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 2 })
    cart = addCartLine(cart, { sku: "A", name: "Pantalla", unitPrice: "10.00", quantity: 1 })
    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]!.quantity).toBe(3)
    expect(cartSubtotal(cart)).toBe("30.00")
    cart = setCartLineQty(cart, "A", 1)
    expect(cartSubtotal(cart)).toBe("10.00")
    cart = setCartLineQty(cart, "A", 0)
    expect(cart.lines).toHaveLength(0)
  })
})
