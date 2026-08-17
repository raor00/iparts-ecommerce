import { paymentMethodById, type PaymentMethodId } from "./payment-methods"

/** IPARTS as payment-rail owner. 250 bps = 2.5% of gross to the owner wallet. */
export const PLATFORM_FEE_BPS = 250

export type PaymentSplit = {
  method: PaymentMethodId
  gross: string
  processorFee: string
  ownerFee: string
  merchantNet: string
  processorBps: number
  ownerBps: number
}

function cents(value: string | number): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n) || n < 0) throw new Error("Monto inválido")
  return Math.round(n * 100)
}

function usd(centsValue: number): string {
  return (centsValue / 100).toFixed(2)
}

export function splitPayment(input: { amount: string; method: PaymentMethodId }): PaymentSplit {
  const method = paymentMethodById(input.method)
  if (!method) throw new Error("Método de pago no soportado")
  const gross = cents(input.amount)
  if (gross <= 0) throw new Error("Monto inválido")
  const processor = Math.round((gross * method.processorBps) / 10_000) + method.processorFixedCents
  const owner = Math.round((gross * PLATFORM_FEE_BPS) / 10_000)
  const leftover = gross - processor
  const ownerCapped = Math.min(owner, Math.max(0, leftover))
  const merchant = leftover - ownerCapped
  return {
    method: method.id,
    gross: usd(gross),
    processorFee: usd(processor),
    ownerFee: usd(ownerCapped),
    merchantNet: usd(merchant),
    processorBps: method.processorBps,
    ownerBps: PLATFORM_FEE_BPS,
  }
}
