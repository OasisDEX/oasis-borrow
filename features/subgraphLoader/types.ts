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
    getPoolData: { poolAddress: string }
    getPoolsTableData: {}
    getNftIds: { walletAddress: string }
    getPositionAuction: { dpmProxyAddress: string }
    getHistory: { dpmProxyAddress: string }
    getClaimedRewards: { walletAddress: string }
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
    getPoolData: SubgraphBaseResponse<{
      pool: AjnaPoolDataResponse
    }>
    getPoolsData: SubgraphBaseResponse<{
      pools: AjnaPoolsDataResponse[]
    }>
    getNftIds: SubgraphBaseResponse<{ nfts: AjnaUserNftsResponse[] }>
    getPositionAuction: SubgraphBaseResponse<{ auctions: AjnaPositionAuctionResponse[] }>
    getAjnaHistory: SubgraphBaseResponse<{
      oasisEvents: AjnaHistoryResponse[]
      borrowerEvents: AjnaBorrowerEventsResponse[]
    }>
    getClaimedRewards: SubgraphBaseResponse<{ claimeds: AjnaClaimedReward[] }>
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
