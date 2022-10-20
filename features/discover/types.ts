export enum DiscoverPages {
  HIGH_RISK_POSITIONS = 'high-risk-positions',
  HIGHEST_MULTIPLY_PNL = 'highest-multiply-pnl',
  MOST_YIELD_EARNED = 'most-yield-earned',
  LARGEST_DEBT = 'largest-debt',
}

export enum DiscoverApiErrors {
  NO_DATA = 1,
  UNKNOWN_ERROR = 2,
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

interface DiscoverTableRowCommon {
  asset: string
  cdpId: number
}

interface DiscoverTableRowStatus {
  status: {
    kind: DiscoverTableVaultStatus
    additionalData?: {
      tillLiquidation?: number
      toStopLoss?: number
    }
  }
}

interface DiscoverTableRowActivity {
  activity: {
    kind: DiscoverTableVaultActivity
    additionalData?: {
      daysAgo: number
    }
  }
}

export type DiscoverTableRowHighRisk = DiscoverTableRowCommon &
  DiscoverTableRowStatus & {
    liquidationPrice: number
    nextOsmPrice: number
    maxLiquidationAmount: number
  }

export type DiscoverTableRowHighestPnl = DiscoverTableRowCommon &
  DiscoverTableRowActivity & {
    collateralValue: number
    currentMultiple: number
    pnl: number
  }

export type DiscoverTableRowMostYield = DiscoverTableRowCommon &
  DiscoverTableRowActivity & {
    netValue: number
    earningsToDate: number
    '30DayAvgApy': number
  }

export type DiscoverTableRowLargestDebt = DiscoverTableRowCommon &
  DiscoverTableRowActivity & {
    collateralValue: number
    vaultDebt: number
    colRatio: {
      level: number
      isAtRisk: boolean
    }
  }

export type DiscoverTableRowData = DiscoverTableRowHighRisk | DiscoverTableRowHighestPnl | DiscoverTableRowMostYield | DiscoverTableRowLargestDebt
