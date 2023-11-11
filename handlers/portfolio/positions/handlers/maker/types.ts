export interface MakerDiscoverPositionsIlk {
  liquidationRatio: string
  pip: {
    value: string
  }
  stabilityFee: string
  tokenSymbol: string
}

export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    debt: string
    ilk: MakerDiscoverPositionsIlk
    liquidationPrice: string
    openedAt: string
    type: string
  }[]
}
