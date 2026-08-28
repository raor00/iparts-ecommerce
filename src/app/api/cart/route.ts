import { addCartLine, cartSubtotal, clampQty, emptyCart, setCartLineQty } from "@/lib/cart"
import { createGuestActor, json, resolveCartActor, withDb } from "@/lib/http"
import { resolvePricedCatalog } from "@/lib/load-catalog"
import { qtyCapError } from "@/lib/public-catalog"
import { findCatalogItem, pricedCartAdd, repriceCart } from "@/lib/reprice"
import { availableQty, getCart, putCart } from "@/lib/store"

export async function GET() {
  const actor = await resolveCartActor()
  if (!actor.cartId) return json({ cart: emptyCart(), subtotal: "0.00" })
  const catalog = await resolvePricedCatalog()
  const cart = withDb((db) => {
    const next = repriceCart(getCart(db, actor.cartId!), catalog, actor.isVip)
    putCart(db, actor.cartId!, next)
    return next
  })
  return json({ cart, subtotal: cartSubtotal(cart) })
}

export async function POST(req: Request) {
  const existing = await resolveCartActor()
  const minted = existing.cartId ? null : createGuestActor()
  const actor = {
    cartId: existing.cartId ?? minted!.cartId,
    isVip: existing.isVip,
    guestSetCookie: minted?.guestSetCookie ?? null,
  }
  const body = (await req.json().catch(() => ({}))) as {
    sku?: string
    name?: string
    unitPrice?: string
    quantity?: number
    setQuantity?: number
  }
  if (!body.sku) return json({ error: "sku requerido" }, 400)
  const catalog = await resolvePricedCatalog()
  const item = findCatalogItem(catalog, body.sku)
  if (!item) return json({ error: "Esa pieza no está en el catálogo" }, 400)
  const extra = actor.guestSetCookie ? [actor.guestSetCookie] : []
  try {
    const wanted =
      typeof body.setQuantity === "number" ? body.setQuantity : (body.quantity ?? 1)
    const cart = withDb((db) => {
      const max = availableQty(db, item.sku, item.quantity)
      if (wanted > max) {
        const cap = qtyCapError(max)
        throw Object.assign(new Error(cap.error), cap)
      }
      let next = getCart(db, actor.cartId)
      if (typeof body.setQuantity === "number") {
        const qty = body.setQuantity <= 0 ? 0 : clampQty(body.setQuantity, max)
        next = setCartLineQty(next, body.sku!, qty)
      } else {
        const addQty = clampQty(body.quantity ?? 1, max)
        if (addQty <= 0) throw Object.assign(new Error("Sin stock"), qtyCapError(0))
        const current = next.lines.find((row) => row.sku === body.sku)?.quantity ?? 0
        const nextQty = clampQty(current + addQty, max)
        const priced = pricedCartAdd({
          sku: body.sku!,
          clientUnitPrice: body.unitPrice,
          quantity: Math.max(1, nextQty - current),
          catalog,
          isVip: actor.isVip,
        })
        next = addCartLine(next, priced)
        next = setCartLineQty(next, body.sku!, nextQty)
      }
      next = repriceCart(next, catalog, actor.isVip)
      putCart(db, actor.cartId, next)
      return next
    })
    return json({ cart, subtotal: cartSubtotal(cart) }, 200, undefined, extra)
  } catch (err) {
    const cap = err as { code?: string; max?: number; message?: string }
    if (cap.code === "QTY_CAP") {
      return json({ error: cap.message, code: "QTY_CAP", max: cap.max }, 409, undefined, extra)
    }
    return json({ error: err instanceof Error ? err.message : "No se pudo actualizar el carrito" }, 400, undefined, extra)
  }
}
