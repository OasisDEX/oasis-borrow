export enum DiscoverPages {
  HIGH_RISK_POSITIONS = 'high-risk-positions',
  HIGHEST_MULTIPLY_PNL = 'highest-multiply-pnl',
  MOST_YIELD_EARNED = 'most-yield-earned',
  LARGEST_DEBT = 'largest-debt',
}

export enum DiscoverApiErrors {
  UNKNOWN_ERROR = 1,
  NO_ENTRIES = 2,
}

export enum DiscoverTableVaultActivity {
  WITHDRAWN = 1,
  INCREASED_RISK = 2,
  DECREASED_RISK = 3,
  CLOSED = 4,
  OPENED = 5,
  DEPOSITED = 6,
}

export enum DiscoverTableVaultStatus {
  LIQUIDATED = 1,
  BEING_LIQUIDATED = 2,
  TILL_LIQUIDATION = 3,
  TO_STOP_LOSS = 4,
  CLOSED_LONG_TIME_AGO = 5,
}

export interface DiscoverFiltersSettings {
  [key: string]: string
}

export type DiscoverTableRowData = {
  [key: string]: string | number
} & {
  colRatio?: {
    level: number
    isAtRiskDanger: boolean
    isAtRiskWarning: boolean
  }
} & {
  activity?: {
    kind: DiscoverTableVaultActivity
    additionalData?: {
      daysAgo: number
    }
  }
} & {
  status?: {
    kind: DiscoverTableVaultStatus
    additionalData?: {
      tillLiquidation?: number
      toStopLoss?: number
    }
  }
}
