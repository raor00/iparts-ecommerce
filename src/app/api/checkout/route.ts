import { assertCanCheckout, isCheckoutAuthError } from "@/lib/checkout-auth"
import { cartSubtotal, emptyCart } from "@/lib/cart"
import { shopConfig } from "@/lib/config"
import { fetchErpCatalog } from "@/lib/erp-stock"
import { json, readSession, withDb } from "@/lib/http"
import { processPayment } from "@/lib/payment"
import { repriceCart } from "@/lib/reprice"
import { addOrder, getCart, putCart } from "@/lib/store"

export async function POST(req: Request) {
  const session = await readSession()
  try {
    assertCanCheckout(session)
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = (await req.json().catch(() => ({}))) as { token?: string }
  const cfg = shopConfig()
  let catalog
  try {
    catalog = await fetchErpCatalog({ erpBaseUrl: cfg.erpBaseUrl, apiKey: cfg.ecommerceApiKey })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "ERP no disponible" }, 502)
  }
  const cart = withDb((db) => repriceCart(getCart(db, session!.userId), catalog, session!.isVip))
  if (cart.lines.length === 0) return json({ error: "El carrito está vacío" }, 400)
  const total = cartSubtotal(cart)
  const pay = processPayment({ amount: total, token: body.token ?? "" })
  if (!pay.ok) return json({ error: pay.error }, 402)
  const order = withDb((db) => {
    const created = addOrder(db, {
      userId: session!.userId,
      status: "paid",
      total,
      paymentRef: pay.reference,
      lines: cart.lines,
    })
    putCart(db, session!.userId, emptyCart())
    return created
  })
  return json({ order })
}
