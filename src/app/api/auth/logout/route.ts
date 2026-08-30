import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth, cookiesFromHeaders, ensureAuthSchema } from "@/lib/auth"

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303)
  try {
    await ensureAuthSchema()
    const out = await auth.api.signOut({
      headers: await headers(),
      returnHeaders: true,
    })
    for (const cookie of cookiesFromHeaders(out.headers)) {
      res.headers.append("set-cookie", cookie)
    }
  } catch {
    res.headers.append(
      "set-cookie",
      "iparts.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    )
  }
  return res
}
