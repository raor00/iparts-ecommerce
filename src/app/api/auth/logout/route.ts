import { NextResponse } from "next/server"
import { shopConfig } from "@/lib/config"
import { clearSessionCookie } from "@/lib/session"

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303)
  res.headers.set("set-cookie", clearSessionCookie(shopConfig().secureCookies))
  return res
}
