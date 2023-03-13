import { NetworkIds } from 'blockchain/network'

export type Subgraphs = {
  Ajna: {
    getEarnData: { dpmProxyAddress: string }
  }
  TempGraph: {
    tempMethod: undefined
  }
}

export type SubgraphBaseResponse<R> = {
  success: boolean
  error: unknown
  response: R
}

export type SubgraphsResponses = {
  Ajna: {
    getEarnData: SubgraphBaseResponse<{
      account: {
        earnPositions: { lps: number; index: number; nft: { id: string } | null }[]
      }
    }>
  }
  TempGraph: {
    tempMethod: SubgraphBaseResponse<undefined>
  }
}

export type SubgraphsRecord = {
  [key in keyof Subgraphs]: {
    [NetworkIds.MAINNET]: string
    [NetworkIds.HARDHAT]: string
    [NetworkIds.GOERLI]: string
  }
}
export type SubgraphMethodsRecord = { [key in keyof Subgraphs['Ajna' & 'Temp']]: string }
