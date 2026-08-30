import { describe, expect, it } from "vitest"
import { auth, cookiesFromHeaders, ensureAuthSchema, sessionCookieIsHttpOnly } from "./auth"
import { isProfileComplete, parseProfile } from "./profile"

describe("Better Auth email/password", () => {
  it("signs up and then rejects a duplicate email", async () => {
    await ensureAuthSchema()
    const email = `ba-${Date.now()}@iparts.local`
    const created = await auth.api.signUpEmail({
      body: { email, password: "password12", name: "Auth Test" },
    })
    expect(created.user.email).toBe(email)
    await expect(
      auth.api.signUpEmail({
        body: { email, password: "password12", name: "Auth Test" },
      }),
    ).rejects.toBeTruthy()
  })

  it("exposes HttpOnly session cookies from Better Auth headers", () => {
    const headers = new Headers()
    headers.append("set-cookie", "iparts.session_token=abc; Path=/; HttpOnly; SameSite=Lax")
    const cookies = cookiesFromHeaders(headers)
    expect(cookies).toHaveLength(1)
    expect(sessionCookieIsHttpOnly(cookies[0]!)).toBe(true)
  })
})

describe("register KYC contract", () => {
  it("blocks checkout-grade registration without a complete profile", () => {
    expect(isProfileComplete(parseProfile({ email: "a@b.c", password: "password12" }))).toBe(false)
  })
})

