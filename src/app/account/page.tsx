import Link from "next/link"
import { redirect } from "next/navigation"
import { readSession, withDb } from "@/lib/http"
import { isProfileComplete } from "@/lib/profile"
import { findUserById, ordersForUser } from "@/lib/store"
import { emptyProfile } from "@/lib/profile"
import { ProfileEditor } from "@/components/profile-editor"

export default async function AccountPage() {
  const session = await readSession()
  if (!session) redirect("/login?next=/account")
  const user = withDb((db) => findUserById(db, session.userId))
  if (!user) redirect("/login?next=/account")
  const orders = withDb((db) => ordersForUser(db, session.userId))
  const complete = isProfileComplete(user.profile)
  return (
    <div className="stack">
      <p className="kicker">{session.isVip ? "Cliente VIP" : "Cuenta de cliente"}</p>
      <h1 className="page-title">Mis datos y pedidos</h1>
      <p className="muted">{session.email}</p>
      {!complete ? (
        <p className="err">Faltan datos de envío o identificación. Completalos para poder pagar.</p>
      ) : (
        <p className="stock">Ficha de cliente completa y guardada.</p>
      )}
      <ProfileEditor initial={user.profile ?? emptyProfile()} />
      <h2 className="page-title" style={{ fontSize: 22, marginTop: 28 }}>
        Mis compras
      </h2>
      {orders.length === 0 ? (
        <p className="muted">
          Aún no hay pedidos. <Link href="/">Ir al catálogo</Link>
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
              {order.shippingSnapshot ? (
                <p className="muted">
                  Envío: {order.shippingSnapshot.addressLine}, {order.shippingSnapshot.city}
                </p>
              ) : null}
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
