import { assertStaff, isCheckoutAuthError } from "@/lib/checkout-auth"
import { json, readSession, withDb } from "@/lib/http"
import { paidOrdersForDispatch, setDispatchStatus } from "@/lib/store"

export async function GET() {
  const session = await readSession()
  try {
    assertStaff(session, ["DISPATCH", "OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const orders = withDb((db) => paidOrdersForDispatch(db))
  return json({ orders })
}

export async function POST(req: Request) {
  const session = await readSession()
  try {
    assertStaff(session, ["DISPATCH", "OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = (await req.json().catch(() => ({}))) as { orderId?: string; status?: "packed" | "shipped" }
  if (!body.orderId || (body.status !== "packed" && body.status !== "shipped")) {
    return json({ error: "Pedido y estado requeridos" }, 400)
  }
  try {
    const order = withDb((db) => setDispatchStatus(db, body.orderId!, body.status!))
    return json({ order })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo actualizar" }, 409)
  }
}
