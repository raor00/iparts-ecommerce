export type SettlementMode = "instant_plugin" | "manual_confirm" | "unavailable"

export type PaymentMethodId = "binance_pay" | "nowpayments_usdt" | "zelle" | "card_intl"

export type PaymentMethod = {
  id: PaymentMethodId
  label: string
  settlement: SettlementMode
  /** Processor cut in basis points (100 = 1%). 0 means the network does not publish a merchant % */
  processorBps: number
  processorFixedCents: number
  processorName: string
  source: string
  notes: string
  availableInVe: boolean
}

/**
 * Processor fees from public merchant pages (not invented).
 * IPARTS platform take is separate — see payment-split.ts.
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "binance_pay",
    label: "Binance Pay (USDT / cripto)",
    settlement: "instant_plugin",
    processorBps: 0,
    processorFixedCents: 0,
    processorName: "Binance Pay",
    source: "https://developers.binance.com/docs/binance-pay/introduction — FAQ merchant: payout on-network sin fee de red; retiro off-network cobra fee de red. La tarifa comercial la confirma el Merchant dashboard.",
    notes:
      "API merchant real (crear orden + webhook PAY_SUCCESS). Requiere KYC merchant, API Key/Secret y wallet Binance. No hay API pública que cobre un % fijo tipo Stripe; el costo típico es 0% entre wallets Binance + fee de retiro si sacás el USDT.",
    availableInVe: true,
  },
  {
    id: "nowpayments_usdt",
    label: "USDT (NOWPayments)",
    settlement: "instant_plugin",
    processorBps: 50,
    processorFixedCents: 0,
    processorName: "NOWPayments",
    source: "https://nowpayments.io/pricing — 0.5% misma moneda; 1% si convierte.",
    notes: "0.5% si el cliente paga USDT y liquidás USDT. +0.5% extra si hay conversión. Más fee de red de la chain.",
    availableInVe: true,
  },
  {
    id: "zelle",
    label: "Zelle (confirmación manual)",
    settlement: "manual_confirm",
    processorBps: 0,
    processorFixedCents: 0,
    processorName: "Zelle (banco del receptor)",
    source: "https://www.zelle.com/faq/im-small-business-using-zelle — Zelle no publica API merchant; el banco decide si cobra.",
    notes:
      "No existe pasarela Zelle para un shop en Venezuela. Es P2P. Algunos bancos USA cobran 0%; Truist ha publicado 1% (tope USD 15) al recibir en cuenta business. El operador confirma el pago a mano. No se puede partir automáticamente a una wallet cripto.",
    availableInVe: false,
  },
  {
    id: "card_intl",
    label: "Tarjeta internacional (Stripe / PayPal)",
    settlement: "unavailable",
    processorBps: 349,
    processorFixedCents: 49,
    processorName: "Stripe / PayPal",
    source: "Stripe 2.9% + $0.30 (US cards). PayPal cross-border ~3.49% + fixed. Stripe no onboardea merchants VE.",
    notes:
      "Solo viable con entidad US/EU. Stripe Connect suma ~0.25% + $0.25 por payout si usás marketplace. No activar hasta tener company en jurisdicción soportada.",
    availableInVe: false,
  },
]

export function paymentMethodById(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((row) => row.id === id)
}
