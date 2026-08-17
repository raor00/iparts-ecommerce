import { describe, expect, it } from "vitest"
import { isVipEmail } from "./vip-account"

describe("isVipEmail", () => {
  it("marks vip@ and vip+ local parts as VIP, not ordinary emails", () => {
    expect(isVipEmail("vip@iparts.local")).toBe(true)
    expect(isVipEmail("vip+taller@correo.com")).toBe(true)
    expect(isVipEmail("ana@iparts.local")).toBe(false)
    expect(isVipEmail("devip@x.com")).toBe(false)
  })
})
