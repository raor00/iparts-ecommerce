import { json, readSession, withDb } from "@/lib/http"
import { ordersForUser } from "@/lib/store"

export async function GET() {
  const session = await readSession()
  if (!session) return json({ error: "Inicia sesión" }, 401)
  const orders = withDb((db) => ordersForUser(db, session.userId))
  return json({ orders })
}
