import { redirect } from "next/navigation"
import { cartSubtotal } from "@/lib/cart"
import { readSession, withDb } from "@/lib/http"
import { getCart } from "@/lib/store"
import { CheckoutForm } from "@/components/checkout-form"

export default async function CheckoutPage() {
  const session = await readSession()
  if (!session) redirect("/login?next=/checkout")
  const cart = withDb((db) => getCart(db, session.userId))
  if (cart.lines.length === 0) redirect("/cart")
  return (
    <div>
      <h1 className="page-title">Pagar pedido</h1>
      <p className="muted">
        {session.email}
        {session.isVip ? " · VIP" : " · mostrador"}
      </p>
      <table className="cart-table">
        <tbody>
          {cart.lines.map((line) => (
            <tr key={line.sku}>
              <td>
                {line.quantity} × {line.name}
              </td>
              <td>${line.unitPrice}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: "16px 0" }}>
        Total <strong className="price">${cartSubtotal(cart)}</strong>
      </p>
      <CheckoutForm amount={cartSubtotal(cart)} />
    </div>
  )
}
