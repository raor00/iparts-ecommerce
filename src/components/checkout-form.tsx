"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payment-methods"
import { splitPayment } from "@/lib/payment-split"

export function CheckoutForm({ amount }: { amount: string }) {
  const [method, setMethod] = useState<PaymentMethodId>("binance_pay")
  const [token, setToken] = useState("")
  const [zelleReference, setZelleReference] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const selected = PAYMENT_METHODS.find((row) => row.id === method)!
  const split = useMemo(() => {
    try {
      return splitPayment({ amount, method })
    } catch {
      return null
    }
  }, [amount, method])

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method, token, zelleReference }),
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
      <fieldset className="pay-methods">
        <legend>Método</legend>
        {PAYMENT_METHODS.map((row) => (
          <label key={row.id} className={row.settlement === "unavailable" ? "muted" : ""}>
            <input
              type="radio"
              name="method"
              value={row.id}
              checked={method === row.id}
              disabled={row.settlement === "unavailable"}
              onChange={() => setMethod(row.id)}
            />
            <span>
              <strong>{row.label}</strong>
              <small>
                {row.settlement === "unavailable"
                  ? "No disponible en VE"
                  : row.processorBps === 0
                    ? "Procesador 0% publicado"
                    : `Procesador ${(row.processorBps / 100).toFixed(2)}%`}
                {" · "}
                Dueño 2.5%
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      {split && (
        <div className="split-card">
          <p>Bruto ${split.gross}</p>
          <p>Procesador (${split.processorBps / 100}%) −${split.processorFee}</p>
          <p>Wallet dueño (2.5%) −${split.ownerFee}</p>
          <p>
            <strong>Neto almacén ${split.merchantNet}</strong>
          </p>
        </div>
      )}
      <p className="muted">{selected.notes}</p>
      {method === "zelle" ? (
        <label>
          Referencia Zelle
          <input value={zelleReference} onChange={(e) => setZelleReference(e.target.value)} placeholder="Nombre o ID del envío" required />
        </label>
      ) : (
        <label>
          ID de intención (hasta conectar API keys)
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="intent_demo" required />
        </label>
      )}
      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy || selected.settlement === "unavailable"} type="submit">
        {method === "zelle" ? "Registrar pago Zelle" : "Confirmar pedido"}
      </button>
    </form>
  )
}
