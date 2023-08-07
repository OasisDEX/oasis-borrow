import { NetworkIds } from 'blockchain/networks'
import { AjnaBorrowerEventsResponse, AjnaHistoryResponse } from 'features/ajna/history/types'
import { AjnaPoolDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { AjnaPoolsDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolsData'
import { AjnaClaimedReward } from 'features/ajna/positions/common/helpers/getAjnaRewards'
import { AjnaUserNftsResponse } from 'features/ajna/rewards/helpers/getAjnaUserNfts'

export type Subgraphs = {
  Ajna: {
    getAjnaEarnPositionData: { dpmProxyAddress: string }
    getAjnaPositionAggregatedData: { dpmProxyAddress: string }
    getAjnaPoolAddress: { collateralAddress: string; quoteAddress: string }
    getAjnaPoolData: { poolAddress: string }
    getAjnaPoolsData: {}
    getAjnaEarnPositionNftId: { walletAddress: string }
    getAjnaClaimedRewards: { walletAddress: string }
    searchAjnaPool: { collateralAddress: string; poolAddress: string; quoteAddress: string }
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
    getAjnaPositionAggregatedData: SubgraphBaseResponse<{
      account: {
        cumulativeDeposit: number
        cumulativeFees: number
        cumulativeWithdraw: number
      }
      auctions: {
        alreadyTaken: boolean
        collateral: number
        debtToCover: number
        endOfGracePeriod: number
        id: string
        inLiquidation: boolean
      }[]
      borrowerEvents: AjnaBorrowerEventsResponse[]
      oasisEvents: AjnaHistoryResponse[]
    }>
    getAjnaPoolAddress: SubgraphBaseResponse<{
      pools: {
        address: string
      }[]
    }>
    getAjnaPoolData: SubgraphBaseResponse<{
      pool: AjnaPoolDataResponse
    }>
    getAjnaPoolsData: SubgraphBaseResponse<{
      pools: AjnaPoolsDataResponse[]
    }>
    getAjnaEarnPositionData: SubgraphBaseResponse<{
      account: {
        earnPositions: {
          lps: number
          index: number
          nft: { id: string } | null
          account: {
            cumulativeDeposit: number
            cumulativeFees: number
            cumulativeWithdraw: number
          }
        }[]
      }
    }>
    getAjnaEarnPositionNftId: SubgraphBaseResponse<{ nfts: AjnaUserNftsResponse[] }>
    getAjnaClaimedRewards: SubgraphBaseResponse<{ claimeds: AjnaClaimedReward[] }>
    searchAjnaPool: SubgraphBaseResponse<{
      pools: {
        address: string
        collateralAddress: string
        quoteTokenAddress: string
      }[]
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
    [NetworkIds.ARBITRUMMAINNET]: ''
    [NetworkIds.ARBITRUMGOERLI]: ''
    [NetworkIds.POLYGONMAINNET]: ''
    [NetworkIds.POLYGONMUMBAI]: ''
    [NetworkIds.OPTIMISMMAINNET]: ''
    [NetworkIds.OPTIMISMGOERLI]: ''
    [NetworkIds.EMPTYNET]: ''
  }
}
export type SubgraphMethodsRecord = { [key in keyof Subgraphs['Ajna' & 'Temp']]: string }
