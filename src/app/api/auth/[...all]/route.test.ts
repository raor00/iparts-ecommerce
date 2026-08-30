import { describe, expect, it, vi } from "vitest"

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
}))

const { POST } = await import("./route")
const { auth } = await import("@/lib/auth")

describe("POST /api/auth/sign-up/email (catch-all)", () => {
  it("does not create a Better Auth user without KYC", async () => {
    const email = `catchall-${Date.now()}@iparts.local`
    const password = "password12"
    const res = await POST(
      new Request("http://shop.local/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, name: "Skip KYC" }),
      }),
    )
    expect(res.status).toBe(403)
    const body = (await res.json()) as { error?: string; user?: { email?: string } }
    expect(body.user).toBeUndefined()
    expect(body.error).toBeTruthy()
    await expect(auth.api.signInEmail({ body: { email, password } })).rejects.toBeTruthy()
  })

  it("leaves auth.api.signUpEmail available for the KYC register route", async () => {
    const email = `server-signup-${Date.now()}@iparts.local`
    const created = await auth.api.signUpEmail({
      body: { email, password: "password12", name: "Server KYC path" },
    })
    expect(created.user.email).toBe(email)
  })
})
