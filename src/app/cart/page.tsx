import Link from "next/link"
import { cartCount, cartSubtotal, lineTotal } from "@/lib/cart"
import { resolveCartActor, withDb } from "@/lib/http"
import { resolvePricedCatalog } from "@/lib/load-catalog"
import { findCatalogItem } from "@/lib/reprice"
import { getCart } from "@/lib/store"
import { isPreviewSku } from "@/lib/preview-catalog"
import { CartQty } from "@/components/cart-qty"

export default async function CartPage() {
  const actor = await resolveCartActor()
  const catalog = await resolvePricedCatalog()
  const cart = actor.cartId ? withDb((db) => getCart(db, actor.cartId!)) : { lines: [] }
  const count = cartCount(cart)
  const total = cartSubtotal(cart)
  return (
    <div>
      <h1 className="page-title">Carrito</h1>
      {cart.lines.length === 0 ? (
        <p className="muted">
          Vacío. <Link href="/c/pantallas">Elige pantallas</Link> o una categoría arriba.
        </p>
      ) : (
        <div className="cart-layout">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.lines.map((line) => {
                const item = findCatalogItem(catalog, line.sku)
                return (
                  <tr key={line.sku}>
                    <td>
                      <Link href={`/product/${encodeURIComponent(line.sku)}`}>
                        <strong>{line.name}</strong>
                      </Link>
                      {!isPreviewSku(line.sku) ? <div className="muted">{line.sku}</div> : null}
                    </td>
                    <td>
                      <CartQty sku={line.sku} quantity={line.quantity} maxQty={99} />
                    </td>
                    <td>${line.unitPrice}</td>
                    <td>${lineTotal(line)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <aside className="cart-summary">
            <p className="kicker">Resumen</p>
            <p>
              {count} {count === 1 ? "pieza" : "piezas"}
            </p>
            <p>
              Total <strong className="price">${total}</strong>
            </p>
            {actor.session ? (
              <Link className="btn" href="/checkout">
                Ir a pagar
              </Link>
            ) : (
              <Link className="btn" href="/login?next=/checkout">
                Entra para pagar
              </Link>
            )}
            <Link className="muted" href="/c/pantallas">
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
