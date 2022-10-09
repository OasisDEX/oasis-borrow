export enum DiscoveryPages {
  HIGH_RISK_POSITIONS,
  HIGHEST_MULTIPLY_PNL,
  MOST_YIELD_EARNED,
  LARGEST_DEBT,
}

export enum DiscoveryTableVaultStatus {
  LIQUIDATED,
  BEING_LIQUIDATED,
  TILL_LIQUIDATION,
  TO_STOP_LOSS,
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
