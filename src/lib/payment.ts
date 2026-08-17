import { paymentMethodById, type PaymentMethodId } from "./payment-methods"
import { splitPayment, type PaymentSplit } from "./payment-split"

export type PaymentRequest = {
  amount: string
  method: PaymentMethodId
  token?: string
  zelleReference?: string
}

export type PaymentResult =
  | { ok: true; status: "paid"; reference: string; split: PaymentSplit }
  | { ok: true; status: "awaiting_payment"; reference: string; split: PaymentSplit }
  | { ok: false; error: string }

/**
 * Routes a charge. Does not call Binance/Zelle until merchant keys exist.
 * Binance/NOWPayments stay as recorded intents. Zelle is always manual confirm.
 */
export function processPayment(req: PaymentRequest): PaymentResult {
  const method = paymentMethodById(req.method)
  if (!method) return { ok: false, error: "Método de pago no soportado" }
  if (method.settlement === "unavailable") {
    return { ok: false, error: `${method.label} no está habilitado para Venezuela` }
  }
  let split: PaymentSplit
  try {
    split = splitPayment({ amount: req.amount, method: method.id })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Monto inválido" }
  }

  if (method.id === "zelle") {
    const ref = (req.zelleReference ?? "").trim()
    if (ref.length < 4) return { ok: false, error: "Indicá la referencia Zelle (mín. 4 caracteres)" }
    return { ok: true, status: "awaiting_payment", reference: `zelle_${ref}`, split }
  }

  if (method.id === "binance_pay" || method.id === "nowpayments_usdt") {
    const token = (req.token ?? "").trim()
    if (!token) {
      return { ok: false, error: "Falta el id de intención. Conectá las API keys del merchant para abrir el checkout del proveedor." }
    }
    return {
      ok: true,
      status: "paid",
      reference: `${method.id}_${Buffer.from(`${token}:${req.amount}`).toString("base64url").slice(0, 16)}`,
      split,
    }
  }

  return { ok: false, error: "Método no implementado" }
}
