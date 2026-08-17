import { describe, expect, it } from "vitest"
import { assertCanCheckout, isCheckoutAuthError } from "./checkout-auth"

describe("assertCanCheckout", () => {
  it("blocks checkout when there is no session and allows a detected session", () => {
    try {
      assertCanCheckout(null)
      throw new Error("expected checkout to be blocked")
    } catch (err) {
      expect(isCheckoutAuthError(err)).toBe(true)
    }
    const session = assertCanCheckout({ userId: "u1", email: "a@b.com", isVip: false })
    expect(session.userId).toBe("u1")
  })
})
