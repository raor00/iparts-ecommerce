import Link from "next/link"
import { redirect } from "next/navigation"
import { readSession, withDb } from "@/lib/http"
import { ordersForUser } from "@/lib/store"

export default async function AccountPage() {
  const session = await readSession()
  if (!session) redirect("/login?next=/account")
  const orders = withDb((db) => ordersForUser(db, session.userId))
  return (
    <div>
      <h1>Mis compras</h1>
      <p className="muted">
        {session.email} {session.isVip ? "· cliente VIP" : ""}
      </p>
      {orders.length === 0 ? (
        <p className="muted">
          Aún no hay pedidos. <Link href="/">Ir al catálogo</Link>
        </p>
      ) : (
        orders.map((order) => (
          <article key={order.id} className="card">
            <h3>{order.id}</h3>
            <p className="muted">
              {order.status} · ${order.total} · {order.paymentRef}
            </p>
            {order.lines.map((line) => (
              <p key={line.sku}>
                {line.quantity} × {line.name}
              </p>
            ))}
          </article>
        ))
      )}
    </div>
  )
}
