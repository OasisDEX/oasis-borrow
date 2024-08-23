export interface MakerDiscoverPositionsIlk {
  id: string
  ilk: string
  liquidationRatio: string
  pip: {
    value: string
  }
  rate: string
  stabilityFee: string
  tokenSymbol: string
}

export interface MakerDiscoverPositionsTrigger {
  commandAddress: string
  executedBlock: string
  removedBlock: string
  triggerData: string
  triggerType: string
}

export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    cumulativeDepositUSD: string
    cumulativeFeesUSD: string
    cumulativeWithdrawnUSD: string
    ilk: MakerDiscoverPositionsIlk
    owner: { id: string }
    liquidationPrice: string
    normalizedDebt: string
    openedAt: string
    triggers: MakerDiscoverPositionsTrigger[]
    type: string
    creator: string // dsProxy
  }[]
}

export interface MakerPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    cumulativeDepositUSD: string
    cumulativeFeesUSD: string
    cumulativeWithdrawnUSD: string
    owner: { id: string }
    liquidationPrice: string
    normalizedDebt: string
    openedAt: string
    triggers: MakerDiscoverPositionsTrigger[]
    type: string
    creator: string // dsProxy
  }[]
  collateralTypes: MakerDiscoverPositionsIlk[]
}

export interface MakerOracleResponse {
  collateralTypes: {
    tokenSymbol: string
    ilk: string
    id: string
    pip: {
      value: string
      next: string
    }
  }[]
}
