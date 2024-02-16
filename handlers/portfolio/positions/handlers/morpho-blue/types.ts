export interface MorphoDpmPositionsMarket {
  collateralToken: {
    address: string
    decimals: string
    symbol: string
  }
  id: string
  latestInterestRates: [
    {
      rate: string
    },
    {
      rate: string
    },
  ]
  liquidationRatio: string
  debtToken: {
    address: string
    decimals: string
    symbol: string
  }
}

export interface MorphoDpmPositionsResponse {
  accounts: {
    address: string
    borrowPositions: {
      market: MorphoDpmPositionsMarket
    }[]
    vaultId: string
  }[]
}
