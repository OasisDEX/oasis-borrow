export enum DiscoveryPages {
  HIGH_RISK_POSITIONS = 'high-risk-positions',
  HIGHEST_MULTIPLY_PNL = 'highest-multiply-pnl',
  MOST_YIELD_EARNED = 'most-yield-earned',
  LARGEST_DEBT = 'largest-debt',
}

export enum DiscoveryTableVaultActivity {
  WITHDRAWN = 1,
  INCREASED_RISK = 2,
  DECREASED_RISK = 3,
  CLOSED = 4,
  OPENED = 5,
  DEPOSITED = 6,
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
  colRatio?: {
    level: number
    isAtRisk: boolean
  }
} & {
  activity?: {
    kind: DiscoveryTableVaultActivity
    additionalData?: {
      daysAgo: number
    }
  }
} & {
  status?: {
    kind: DiscoveryTableVaultStatus
    additionalData?: {
      tillLiquidation?: number
      toStopLoss?: number
    }
  }
}
