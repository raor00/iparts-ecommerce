/** Common shoppers pay a retail markup on the ERP wholesale salePrice. VIP pays wholesale. */
export const COMMON_MARKUP = 1.18

export function selectOfferPrice(input: {
  salePrice: string | number
  isVip: boolean
}): { unitPrice: string; compareAt: string | null; isVip: boolean } {
  const wholesale = Number(input.salePrice)
  if (!Number.isFinite(wholesale) || wholesale < 0) {
    throw new Error("salePrice must be a non-negative number")
  }
  const retail = Math.round(wholesale * COMMON_MARKUP * 100) / 100
  if (input.isVip) {
    return {
      unitPrice: wholesale.toFixed(2),
      compareAt: retail > wholesale ? retail.toFixed(2) : null,
      isVip: true,
    }
  }
  return {
    unitPrice: retail.toFixed(2),
    compareAt: null,
    isVip: false,
  }
}
