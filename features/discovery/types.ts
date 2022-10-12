export enum DiscoveryPages {
  HIGH_RISK_POSITIONS = 'high-risk-positions',
  HIGHEST_MULTIPLY_PNL = 'highest-multiply-pnl',
  MOST_YIELD_EARNED = 'most-yield-earned',
  LARGEST_DEBT = 'largest-debt',
}

export enum DiscoveryTableVaultStatus {
  LIQUIDATED = 1,
  BEING_LIQUIDATED = 2,
  TILL_LIQUIDATION = 3,
  TO_STOP_LOSS = 4,
  CLOSED_LONG_TIME_AGO = 5,
}

export interface DiscoveryFiltersSettings {
  [key: string]: string
}

export type DiscoveryTableRowData = {
  [key: string]: string | number
} & {
  status?: {
    kind: DiscoveryTableVaultStatus
    additionalData?: {
      tillLiquidation?: number
      toStopLoss?: number
    }
  }
}
