interface AjnaDpmPositionsPool {
  address: string
  collateralToken: {
    address: string
    symbol: string
  }
  interestRate: string
  lup: string
  quoteToken: {
    address: string
    symbol: string
  }
}

interface AjnaDpmPositionsProtocolEvent {
  timestamp: number
}

interface AjnaDpmPositionsPosition {
  pool: AjnaDpmPositionsPool
  protocolEvents: [AjnaDpmPositionsProtocolEvent]
}

export interface AjnaDpmPositionsResponse {
  accounts: {
    address: string
    borrowPositions: AjnaDpmPositionsPosition[]
    earnPositions: AjnaDpmPositionsPosition[]
    vaultId: string
  }[]
}
