export enum DiscoveryPages {
  HIGH_RISK_POSITIONS = 'high-risk-positions',
  HIGHEST_MULTIPLY_PNL = 'highest-multiply-pnl',
  MOST_YIELD_EARNED = 'most-yield-earned',
  LARGEST_DEBT = 'largest-debt',
}

export interface DiscoveryFiltersSettings {
  [key: string]: string
}
