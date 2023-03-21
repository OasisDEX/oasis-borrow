import { NetworkIds } from 'blockchain/network'
import { AjnaPoolDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolData'

export type Subgraphs = {
  Ajna: {
    getEarnData: { dpmProxyAddress: string }
    getPoolData: { poolAddress: string }
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
    getPoolData: SubgraphBaseResponse<{
      pool: AjnaPoolDataResponse
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
