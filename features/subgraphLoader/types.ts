import { NetworkIds } from 'blockchain/networks'
import {
  AjnaBorrowerEventsResponse,
  AjnaHistoryResponse,
} from 'features/ajna/positions/common/helpers/getAjnaHistory'
import { AjnaPoolDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { AjnaPoolsDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
import { AjnaClaimedReward } from 'features/ajna/positions/common/helpers/getAjnaRewards'
import { AjnaPositionAuctionResponse } from 'features/ajna/rewards/helpers/getAjnaPositionAuction'
import { AjnaUserNftsResponse } from 'features/ajna/rewards/helpers/getAjnaUserNfts'

export type Subgraphs = {
  Ajna: {
    getEarnData: { dpmProxyAddress: string }
    getPositionCumulatives: { dpmProxyAddress: string }
    getPoolAddress: { collateralAddress: string; quoteAddress: string }
    getPoolData: { poolAddress: string }
    getPoolsTableData: {}
    getNftIds: { walletAddress: string }
    getPositionAuction: { dpmProxyAddress: string }
    getHistory: { dpmProxyAddress: string }
    getClaimedRewards: { walletAddress: string }
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
    getEarnData: SubgraphBaseResponse<{
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
    getPositionCumulatives: SubgraphBaseResponse<{
      account: {
        cumulativeDeposit: number
        cumulativeFees: number
        cumulativeWithdraw: number
      }
    }>
    getPoolAddress: SubgraphBaseResponse<{
      pools: {
        address: string
      }[]
    }>
    getPoolData: SubgraphBaseResponse<{
      pool: AjnaPoolDataResponse
    }>
    getPoolsTableData: SubgraphBaseResponse<{
      pools: AjnaPoolsDataResponse[]
    }>
    getNftIds: SubgraphBaseResponse<{ nfts: AjnaUserNftsResponse[] }>
    getPositionAuction: SubgraphBaseResponse<{ auctions: AjnaPositionAuctionResponse[] }>
    getAjnaHistory: SubgraphBaseResponse<{
      oasisEvents: AjnaHistoryResponse[]
      borrowerEvents: AjnaBorrowerEventsResponse[]
    }>
    getClaimedRewards: SubgraphBaseResponse<{ claimeds: AjnaClaimedReward[] }>
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
