export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    debt: string
    ilk: {
      liquidationRatio: string
      pip: {
        value: string
      }
      tokenSymbol: string
    }
    liquidationPrice: string
    openedAt: string
    type: string
  }[]
}
