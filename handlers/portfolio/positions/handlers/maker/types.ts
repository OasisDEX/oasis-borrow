export interface MakerDiscoverPositionsResponse {
  cdps: {
    cdp: string
    collateral: string
    debt: string
    type: string
  }[]
}
