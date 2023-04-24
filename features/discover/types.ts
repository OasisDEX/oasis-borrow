import { ReactNode } from 'react'

export enum DiscoverPages {
  HIGHEST_RISK_POSITIONS = 'highest-risk-positions',
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
}

export enum DiscoverFilterType {
  SINGLE,
  MULTI,
  HIDDEN,
}

export interface DiscoverFiltersSettings {
  [key: string]: string
}

export type DiscoverTableColRatioRowData = {
  level: number
  isAtRiskDanger: boolean
  isAtRiskWarning: boolean
}

export type DiscoverTableActivityRowData = {
  kind: DiscoverTableVaultActivity
  additionalData?: {
    timestamp?: number
  }
}

export type DiscoverTableStatusRowData = {
  kind: DiscoverTableVaultStatus
  additionalData?: {
    timestamp?: number
    tillLiquidation?: number
    toStopLoss?: number
  }
}

export type DiscoverTableStatusRowDataApi = DiscoverTableStatusRowData & {
  additionalData?: {
    stopLossLevel?: number
  }
}

export type DiscoverTableRowData = {
  [key: string]:
    | string
    | number
    | ReactNode
    | DiscoverTableColRatioRowData
    | DiscoverTableActivityRowData
    | DiscoverTableStatusRowData
} & {
  colRatio?: DiscoverTableColRatioRowData
  activity?: DiscoverTableActivityRowData
  status?: DiscoverTableStatusRowData
}
