import Link from "next/link"
import { cartSubtotal } from "@/lib/cart"
import { readSession, withDb } from "@/lib/http"
import { getCart } from "@/lib/store"

export default async function CartPage() {
  const session = await readSession()
  if (!session) {
    return (
      <div className="auth-shell">
        <p className="kicker">Carrito</p>
        <h1>Entra para guardar las piezas</h1>
        <p className="muted">El carrito va con tu cuenta. Así el precio VIP o de mostrador queda en el pedido.</p>
        <Link className="btn" href="/login?next=/cart">
          Entrar
        </Link>
      </div>
    )
  }
  const cart = withDb((db) => getCart(db, session.userId))
  return (
    <div>
      <h1 className="page-title">Carrito</h1>
      {cart.lines.length === 0 ? (
        <p className="muted">
          Vacío. <Link href="/">Elige un modelo</Link> o una categoría arriba.
        </p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Cant.</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {cart.lines.map((line) => (
                <tr key={line.sku}>
                  <td>
                    <strong>{line.name}</strong>
                    <div className="muted">{line.sku}</div>
                  </td>
                  <td>{line.quantity}</td>
                  <td>${line.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16 }}>
            Total <strong className="price">${cartSubtotal(cart)}</strong>
          </p>
          <Link className="btn" href="/checkout">
            Ir a pagar
          </Link>
        </>
      )}
    </div>
  )
}
