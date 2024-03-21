export interface Erc4626DpmPositionsResponse {
  positions: {
    account: {
      address: string
      user: {
        id: string
      }
      vaultId: string
    }
    vault: {
      asset: {
        address: string
        decimals: string
        symbol: string
      }
      id: string
    }
  }[]
}
