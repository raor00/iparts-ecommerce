"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ProductBuyBox({
  sku,
  maxQty,
  disabled,
  compact = false,
}: {
  sku: string
  maxQty: number
  disabled?: boolean
  compact?: boolean
}) {
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const router = useRouter()
  const out = disabled || maxQty <= 0
  const nextQty = Math.min(Math.max(1, qty), Math.max(1, maxQty))

  async function add() {
    if (out || busy) return
    setBusy(true)
    setMsg("")
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sku, quantity: nextQty }),
    })
    setBusy(false)
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string; max?: number }
    if (!res.ok) {
      setMsg(data.code === "QTY_CAP" ? (data.error ?? "Sin stock suficiente") : (data.error ?? "No se pudo agregar"))
      return
    }
    setMsg(nextQty === 1 ? "Agregada" : `${nextQty} en el carrito`)
    router.refresh()
  }

  return (
    <div className={compact ? "buybox compact" : "buybox"} onClick={(e) => e.stopPropagation()}>
      <div className="qty" role="group" aria-label="Cantidad">
        <button
          type="button"
          aria-label="Quitar una"
          disabled={out || nextQty <= 1}
          onClick={() => setQty((n) => Math.max(1, n - 1))}
        >
          −
        </button>
        <span className="qty-val" aria-live="polite">
          {nextQty}
        </span>
        <button
          type="button"
          aria-label="Sumar una"
          disabled={out || nextQty >= maxQty}
          onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
        >
          +
        </button>
      </div>
      <button className="btn add-btn" type="button" disabled={out || busy} onClick={() => void add()}>
        {out ? "Sin stock" : busy ? "…" : compact ? "Agregar" : "Agregar al carrito"}
      </button>
      {msg ? <p className="buy-msg">{msg}</p> : null}
    </div>
  )
}
