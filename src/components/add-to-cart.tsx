"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AddToCart(props: { sku: string; name: string; unitPrice: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const router = useRouter()
  return (
    <div>
      <button
        className="btn"
        disabled={props.disabled || busy}
        onClick={async () => {
          setBusy(true)
          setMsg("")
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(props),
          })
          setBusy(false)
          if (res.status === 401) {
            router.push(`/login?next=/product/${encodeURIComponent(props.sku)}`)
            return
          }
          setMsg(res.ok ? "Agregado al carrito" : "No se pudo agregar")
          if (res.ok) router.refresh()
        }}
      >
        {props.disabled ? "Sin stock" : "Agregar al carrito"}
      </button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  )
}
