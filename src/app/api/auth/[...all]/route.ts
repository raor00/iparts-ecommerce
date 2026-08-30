import { toNextJsHandler } from "better-auth/next-js"
import { auth, ensureAuthSchema } from "@/lib/auth"

const handler = toNextJsHandler(auth)

function isPublicSignUp(req: Request): boolean {
  const path = new URL(req.url).pathname.replace(/\/+$/, "")
  return path === "/api/auth/sign-up/email" || path.startsWith("/api/auth/sign-up/")
}

async function withSchema(req: Request, method: "GET" | "POST") {
  if (isPublicSignUp(req)) {
    return new Response(JSON.stringify({ error: "Usá /api/auth/register" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    })
  }
  await ensureAuthSchema()
  return handler[method](req)
}

export const GET = (req: Request) => withSchema(req, "GET")
export const POST = (req: Request) => withSchema(req, "POST")
