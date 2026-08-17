import { addCartLine, setCartLineQty, cartSubtotal } from "@/lib/cart"
import { json, readSession, withDb } from "@/lib/http"
import { getCart, putCart } from "@/lib/store"

export async function GET() {
  const session = await readSession()
  if (!session) return json({ error: "Inicia sesión para ver el carrito" }, 401)
  const cart = withDb((db) => getCart(db, session.userId))
  return json({ cart, subtotal: cartSubtotal(cart) })
}

export async function POST(req: Request) {
  const session = await readSession()
  if (!session) return json({ error: "Inicia sesión para agregar al carrito" }, 401)
  const body = (await req.json().catch(() => ({}))) as {
    sku?: string
    name?: string
    unitPrice?: string
    quantity?: number
    setQuantity?: number
  }
  if (!body.sku) return json({ error: "sku requerido" }, 400)
  const cart = withDb((db) => {
    let next = getCart(db, session.userId)
    if (typeof body.setQuantity === "number") next = setCartLineQty(next, body.sku!, body.setQuantity)
    else
      next = addCartLine(next, {
        sku: body.sku!,
        name: body.name ?? body.sku!,
        unitPrice: body.unitPrice ?? "0.00",
        quantity: body.quantity ?? 1,
      })
    putCart(db, session.userId, next)
    return next
  })
  return json({ cart, subtotal: cartSubtotal(cart) })
}
