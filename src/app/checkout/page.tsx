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
      <h1>Checkout</h1>
      <p className="muted">Sesión detectada: {session.email}{session.isVip ? " · VIP" : ""}</p>
      <div className="card">
        {cart.lines.map((line) => (
          <p key={line.sku}>
            {line.quantity} × {line.name} · ${line.unitPrice}
          </p>
        ))}
        <p>Total ${cartSubtotal(cart)}</p>
      </div>
      <CheckoutForm />
    </div>
  )
}
