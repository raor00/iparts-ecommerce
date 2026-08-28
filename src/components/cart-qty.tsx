"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

export function CartQty({ sku, quantity, maxQty }: { sku: string; quantity: number; maxQty: number }) {
  const [busy, start] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  function setQuantity(next: number) {
    start(async () => {
      setError("")
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sku, setQuantity: next }),
      })
      if (!res.ok) {
        setError("No se pudo actualizar")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="qty-wrap">
      <div className="qty" role="group" aria-label="Cantidad">
        <button type="button" aria-label="Quitar una" disabled={busy} onClick={() => setQuantity(quantity - 1)}>
          −
        </button>
        <span className="qty-val">{quantity}</span>
        <button
          type="button"
          aria-label="Sumar una"
          disabled={busy || quantity >= maxQty}
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </button>
      </div>
      <button type="button" className="linkish" disabled={busy} onClick={() => setQuantity(0)}>
        Quitar
      </button>
      {error ? <p className="err">{error}</p> : null}
    </div>
  )
}
