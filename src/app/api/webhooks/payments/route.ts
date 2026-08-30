import { json, withDb } from "@/lib/http"
import { applyPaidSettlement } from "@/lib/order-flow"
import { paymentWebhookSecret, verifySignedPayload, webhookConfigured } from "@/lib/payment-webhook"

export async function POST(req: Request) {
  const secret = paymentWebhookSecret()
  if (!webhookConfigured(secret)) return json({ error: "Webhook de pagos no configurado" }, 503)
  const payload = await req.text()
  const signature = req.headers.get("x-payment-signature") ?? ""
  if (!verifySignedPayload(payload, secret, signature)) return json({ error: "Firma inválida" }, 401)
  let body: { processorPaymentId?: string; orderId?: string; status?: string }
  try {
    body = JSON.parse(payload) as { processorPaymentId?: string; orderId?: string; status?: string }
  } catch {
    return json({ error: "JSON inválido" }, 400)
  }
  if (body.status !== "paid" || !body.orderId) return json({ error: "Evento ignorado" }, 202)
  try {
    const order = withDb((db) => {
      const found = db.orders.find((row) => row.id === body.orderId)
      if (!found) throw new Error("Pedido no encontrado")
      if (found.processorPaymentId && found.processorPaymentId === body.processorPaymentId) return found
      if (found.status !== "awaiting_payment") return found
      found.processorPaymentId = body.processorPaymentId
      applyPaidSettlement(db, found)
      found.status = "ready_to_pack"
      found.dispatchStatus = "ready_to_pack"
      return found
    })
    return json({ order })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo asentar" }, 409)
  }
}
