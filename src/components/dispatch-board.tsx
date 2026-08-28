"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ShopOrder } from "@/lib/store"

export function DispatchBoard({ orders }: { orders: ShopOrder[] }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()
  async function mark(orderId: string, status: "packed" | "shipped") {
    setBusy(orderId)
    setError("")
    const res = await fetch("/api/dispatch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    })
    const data = (await res.json()) as { error?: string }
    setBusy(null)
    if (!res.ok) {
      setError(data.error ?? "No se pudo actualizar")
      return
    }
    router.refresh()
  }
  if (orders.length === 0) return <p className="muted">No hay pedidos listos para armar.</p>
  return (
    <div className="stack">
      {error ? <p className="err">{error}</p> : null}
      {orders.map((order) => {
        const ship = order.shippingSnapshot
        return (
          <article key={order.id} className="card" style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 12 }}>
            <p className="kicker">{order.id} · {order.dispatchStatus ?? order.status}</p>
            <p>
              <strong>{ship ? `${ship.firstName} ${ship.lastName}` : order.userId}</strong>
              {ship?.nationalId ? ` · ${ship.nationalId}` : ""}
            </p>
            {ship ? (
              <p className="muted">
                {ship.addressLine}, {ship.city}, {ship.state} {ship.postalCode} · {ship.country}
                <br />
                {ship.phone}
                {ship.isCompany ? ` · ${ship.companyName} ${ship.companyTaxId}` : ""}
              </p>
            ) : null}
            <ul>
              {order.lines.map((line) => (
                <li key={line.sku}>
                  {line.quantity} × {line.name}
                </li>
              ))}
            </ul>
            <p>
              Total <strong>${order.total}</strong>
            </p>
            <div className="mast-actions">
              {order.dispatchStatus !== "packed" && order.dispatchStatus !== "shipped" ? (
                <button className="btn" type="button" disabled={busy === order.id} onClick={() => void mark(order.id, "packed")}>
                  Marcar armado
                </button>
              ) : null}
              {order.dispatchStatus === "packed" ? (
                <button className="btn" type="button" disabled={busy === order.id} onClick={() => void mark(order.id, "shipped")}>
                  Marcar enviado
                </button>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
