export interface MakerDiscoverPositionsIlk {
  ilk: string
  liquidationRatio: string
  pip: {
    value: string
  }
  rate: string
  stabilityFee: string
  tokenSymbol: string
}

export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    cumulativeDepositUSD: string
    cumulativeFeesUSD: string
    cumulativeWithdrawnUSD: string
    ilk: MakerDiscoverPositionsIlk
    liquidationPrice: string
    normalizedDebt: string
    openedAt: string
    type: string
  }[]
}
