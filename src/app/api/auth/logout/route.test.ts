import { describe, expect, it } from "vitest"
import { POST } from "./route"

describe("POST /api/auth/logout", () => {
  it("redirects to / after clearing the session cookie", async () => {
    const res = await POST(new Request("http://shop.local/api/auth/logout", { method: "POST" }))
    expect(res.status).toBe(303)
    expect(res.headers.get("location")).toBe("http://shop.local/")
    const cookie = res.headers.get("set-cookie") ?? ""
    expect(cookie).toContain("iparts_shop_session=")
    expect(cookie).toContain("Max-Age=0")
    expect(cookie).toContain("HttpOnly")
    const body = await res.text()
    expect(body).not.toContain('"ok"')
  })
})
