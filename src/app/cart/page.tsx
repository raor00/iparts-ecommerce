import Link from "next/link"
import { cartSubtotal } from "@/lib/cart"
import { readSession, withDb } from "@/lib/http"
import { getCart } from "@/lib/store"

export default async function CartPage() {
  const session = await readSession()
  if (!session) {
    return (
      <div>
        <h1>Carrito</h1>
        <p>Para guardar el carrito e ir a pagar, inicia sesión.</p>
        <Link className="btn" href="/login?next=/cart">
          Entrar
        </Link>
      </div>
    )
  }
  const cart = withDb((db) => getCart(db, session.userId))
  return (
    <div>
      <h1>Carrito</h1>
      {cart.lines.length === 0 ? (
        <p className="muted">Vacío. Elige un modelo en el catálogo.</p>
      ) : (
        <div className="card">
          {cart.lines.map((line) => (
            <p key={line.sku}>
              {line.quantity} × {line.name} · ${line.unitPrice}
            </p>
          ))}
          <p>Total ${cartSubtotal(cart)}</p>
          <Link className="btn" href="/checkout">
            Ir a pagar
          </Link>
        </div>
      )}
    </div>
  )
}
