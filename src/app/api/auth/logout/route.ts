import { shopConfig } from "@/lib/config"
import { json } from "@/lib/http"
import { clearSessionCookie } from "@/lib/session"

export async function POST() {
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie(shopConfig().secureCookies) })
}
