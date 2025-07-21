// Swiss currency formatting utilities
export function formatCHF(
  amount: number,
  options?: {
    showDecimals?: boolean
    compact?: boolean
  },
): string {
  const { showDecimals = true, compact = false } = options || {}

  if (compact && amount >= 1000) {
    if (amount >= 1000000) {
      return `CHF ${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `CHF ${(amount / 1000).toFixed(0)}k`
    }
  }

  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 0 : 0,
  }).format(amount)
}

export function parseCHF(value: string): number {
  // Remove CHF, spaces, and convert to number
  return Number.parseFloat(value.replace(/[CHF\s']/g, "").replace(",", ".")) || 0
}

export const SWISS_VAT_RATE = 0.077 // 7.7%

export function calculateVAT(amount: number): number {
  return amount * SWISS_VAT_RATE
}

export function addVAT(amount: number): number {
  return amount * (1 + SWISS_VAT_RATE)
}
