export interface AjnaDpmPositionsPool {
  address: string
  collateralToken: {
    address: string
    symbol: string
  }
  quoteToken: {
    address: string
    symbol: string
  }
}

export interface AjnaDpmPositionsProtocolEvent {
  timestamp: string
}

export interface AjnaDpmPositionsPosition {
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
