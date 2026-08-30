import { describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ get: () => undefined }),
}))

const { POST } = await import("./route")

describe("POST /api/auth/logout", () => {
  it("redirects to / after clearing the session cookie", async () => {
    const res = await POST(new Request("http://shop.local/api/auth/logout", { method: "POST" }))
    expect(res.status).toBe(303)
    expect(res.headers.get("location")).toBe("http://shop.local/")
    const cookie = res.headers.get("set-cookie") ?? ""
    expect(cookie.toLowerCase()).toContain("httponly")
    expect(cookie).toMatch(/Max-Age=0|max-age=0/i)
    const body = await res.text()
    expect(body).not.toContain('"ok"')
  })
})
