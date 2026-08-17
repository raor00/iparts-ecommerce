import { addCartLine, setCartLineQty, cartSubtotal } from "@/lib/cart"
import { json, readSession, withDb } from "@/lib/http"
import { resolvePricedCatalog } from "@/lib/load-catalog"
import { pricedCartAdd, repriceCart } from "@/lib/reprice"
import { getCart, putCart } from "@/lib/store"

export async function GET() {
  const session = await readSession()
  if (!session) return json({ error: "Inicia sesión para ver el carrito" }, 401)
  const catalog = await resolvePricedCatalog()
  const cart = withDb((db) => {
    const next = repriceCart(getCart(db, session.userId), catalog, session.isVip)
    putCart(db, session.userId, next)
    return next
  })
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
  const catalog = await resolvePricedCatalog()
  try {
    const cart = withDb((db) => {
      let next = getCart(db, session.userId)
      if (typeof body.setQuantity === "number") next = setCartLineQty(next, body.sku!, body.setQuantity)
      else {
        const priced = pricedCartAdd({
          sku: body.sku!,
          clientUnitPrice: body.unitPrice,
          quantity: body.quantity ?? 1,
          catalog,
          isVip: session.isVip,
        })
        next = addCartLine(next, priced)
      }
      next = repriceCart(next, catalog, session.isVip)
      putCart(db, session.userId, next)
      return next
    })
    return json({ cart, subtotal: cartSubtotal(cart) })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo actualizar el carrito" }, 400)
  }
}
