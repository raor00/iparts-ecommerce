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
      <p className="kicker">{session.isVip ? "Cliente VIP" : "Cuenta"}</p>
      <h1 className="page-title">Mis compras</h1>
      <p className="muted">{session.email}</p>
      {orders.length === 0 ? (
        <p className="muted">
          Aún no hay pedidos. <Link href="/">Ir al mostrador</Link>
        </p>
      ) : (
        <div className="grid">
          {orders.map((order) => (
            <article key={order.id} className="card" style={{ padding: 16 }}>
              <h3>{order.id}</h3>
              <p className="muted">
                {order.status} · ${order.total}
                {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
              </p>
              {order.ownerFee && (
                <p className="muted">
                  Procesador ${order.processorFee} · Dueño ${order.ownerFee} · Neto ${order.merchantNet}
                </p>
              )}
              {order.lines.map((line) => (
                <p key={line.sku}>
                  {line.quantity} × {line.name}
                </p>
              ))}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
