import { assertCanCheckout, isCheckoutAuthError } from "@/lib/checkout-auth"
import { cartSubtotal, emptyCart } from "@/lib/cart"
import { json, readSession, withDb } from "@/lib/http"
import { resolvePricedCatalog } from "@/lib/load-catalog"
import { processPayment } from "@/lib/payment"
import { paymentMethodById, type PaymentMethodId } from "@/lib/payment-methods"
import { repriceCart } from "@/lib/reprice"
import { addOrder, creditOwnerWallet, getCart, putCart } from "@/lib/store"

export async function POST(req: Request) {
  const session = await readSession()
  try {
    assertCanCheckout(session)
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = (await req.json().catch(() => ({}))) as {
    token?: string
    method?: PaymentMethodId
    zelleReference?: string
  }
  const method = paymentMethodById(body.method ?? "")
  if (!method) return json({ error: "Elegí un método de pago" }, 400)
  const catalog = await resolvePricedCatalog()
  const cart = withDb((db) => repriceCart(getCart(db, session!.userId), catalog, session!.isVip))
  if (cart.lines.length === 0) return json({ error: "El carrito está vacío" }, 400)
  const total = cartSubtotal(cart)
  const pay = processPayment({
    amount: total,
    method: method.id,
    token: body.token,
    zelleReference: body.zelleReference,
  })
  if (!pay.ok) return json({ error: pay.error }, 402)
  const order = withDb((db) => {
    const created = addOrder(db, {
      userId: session!.userId,
      status: pay.status,
      total,
      paymentRef: pay.reference,
      paymentMethod: method.id,
      processorFee: pay.split.processorFee,
      ownerFee: pay.split.ownerFee,
      merchantNet: pay.split.merchantNet,
      lines: cart.lines,
    })
    if (pay.status === "paid") {
      creditOwnerWallet(db, {
        orderId: created.id,
        amount: pay.split.ownerFee,
        note: `Pasarela ${method.id} ${pay.split.ownerBps / 100}%`,
      })
    }
    putCart(db, session!.userId, emptyCart())
    return created
  })
  return json({ order, split: pay.split })
}
