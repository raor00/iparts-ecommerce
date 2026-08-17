"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CheckoutForm() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = (await res.json()) as { error?: string; order?: { id: string } }
        setBusy(false)
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?next=/checkout")
            return
          }
          setError(data.error ?? "Pago rechazado")
          return
        }
        router.push("/account")
      }}
    >
      <label>
        Token de pago
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="tok_demo" required />
      </label>
      {error && <p>{error}</p>}
      <button className="btn" disabled={busy} type="submit">
        Pagar ahora
      </button>
    </form>
  )
}
