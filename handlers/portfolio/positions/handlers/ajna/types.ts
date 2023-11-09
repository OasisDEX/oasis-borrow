interface AjnaDpmPositionsPool {
  collateralToken: {
    address: string
    symbol: string
  }
  quoteToken: {
    address: string
    symbol: string
  }
  address: string
}

interface AjnaDpmPositionsPosition {
  pool: AjnaDpmPositionsPool
}

export interface AjnaDpmPositionsResponse {
  accounts: {
    borrowPositions: AjnaDpmPositionsPosition[]
    earnPositions: AjnaDpmPositionsPosition[]
  }[]
}
