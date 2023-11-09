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
