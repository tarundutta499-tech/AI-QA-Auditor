export interface RegionPricing {
  id: string
  name: string
  rate: number // cost per minute in shown currency
  currency: string
  symbol: string // rate currency symbol
  manualQaCostPerCall: number // cost of manual QA equivalent per call in local currency
  manualQaSymbol: string // symbol for manual QA cost
  exchangeRateToUSD?: number // local currency units per 1 USD (for USD rates)
  avgCallMinutes: number // default: 7 (editable)
  avgCallsPerAgentPerMonth: number // default: 150 (editable)
}

export const PRICING_CONFIG: Record<string, RegionPricing> = {
  india: {
    id: "india",
    name: "India",
    rate: 1.25,
    currency: "INR",
    symbol: "₹",
    manualQaCostPerCall: 80,
    manualQaSymbol: "₹",
    avgCallMinutes: 7,
    avgCallsPerAgentPerMonth: 150,
  },
  philippines: {
    id: "philippines",
    name: "Philippines",
    rate: 0.035,
    currency: "USD",
    symbol: "$",
    manualQaCostPerCall: 80,
    manualQaSymbol: "₱",
    exchangeRateToUSD: 58.0, // 1 USD = 58 PHP
    avgCallMinutes: 7,
    avgCallsPerAgentPerMonth: 150,
  },
  dubai: {
    id: "dubai",
    name: "Dubai/UAE",
    rate: 0.06,
    currency: "USD",
    symbol: "$",
    manualQaCostPerCall: 14,
    manualQaSymbol: "AED ",
    exchangeRateToUSD: 3.673, // 1 USD = 3.673 AED
    avgCallMinutes: 7,
    avgCallsPerAgentPerMonth: 150,
  },
  eu: {
    id: "eu",
    name: "EU (RO/BG/PL)",
    rate: 0.05,
    currency: "EUR",
    symbol: "€",
    manualQaCostPerCall: 2.05,
    manualQaSymbol: "€",
    avgCallMinutes: 7,
    avgCallsPerAgentPerMonth: 150,
  },
}
