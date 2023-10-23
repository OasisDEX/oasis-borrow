import type { NetworkIds } from 'blockchain/networks'
import type { AjnaBorrowerEventsResponse, AjnaHistoryResponse } from 'features/ajna/history/types'
import type { AjnaPoolDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolData.types'
import type { AjnaPoolsDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolsData.types'
import type { AjnaClaimedReward } from 'features/ajna/positions/common/helpers/getAjnaRewards.types'
import type { SearchAjnaPoolResponse } from 'features/ajna/positions/common/helpers/searchAjnaPool.types'
import type { AavePositionHistoryResponse } from 'features/positionHistory/types'
import type { ClaimedReferralRewards } from 'features/referralOverview/getClaimedReferralRewards.types'

export type Subgraphs = {
  Ajna: {
    getAjnaEarnPositionData: { dpmProxyAddress: string; poolAddress: string }
    getAjnaPositionAggregatedData: {
      dpmProxyAddress: string
      collateralAddress: string
      quoteAddress: string
    }
    getAjnaPoolAddress: { collateralAddress: string; quoteAddress: string }
    getAjnaPoolData: { poolAddress: string }
    getAjnaCumulatives: { dpmProxyAddress: string; poolAddress: string }
    getAjnaPoolsData: {}
    getAjnaClaimedRewards: { walletAddress: string }
    searchAjnaPool: { collateralAddress: string[]; poolAddress: string[]; quoteAddress: string[] }
  }
  Aave: {
    getAaveHistory: { dpmProxyAddress: string }
  }
  TempGraph: {
    tempMethod: undefined
  }
  Referral: {
    getClaimedReferralRewards: { walletAddress: string }
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
    getAjnaCumulatives: SubgraphBaseResponse<{
      account: {
        earnPositions: {
          earnCumulativeFeesInQuoteToken: number
          earnCumulativeQuoteTokenDeposit: number
          earnCumulativeQuoteTokenWithdraw: number
        }[]
        borrowPositions: {
          borrowCumulativeDepositUSD: number
          borrowCumulativeFeesUSD: number
          borrowCumulativeWithdrawUSD: number
        }[]
      }
    }>
    getAjnaPoolsData: SubgraphBaseResponse<{
      pools: AjnaPoolsDataResponse[]
    }>
    getAjnaEarnPositionData: SubgraphBaseResponse<{
      account: {
        earnPositions: {
          earnCumulativeQuoteTokenDeposit: number
          earnCumulativeFeesInQuoteToken: number
          earnCumulativeQuoteTokenWithdraw: number
          bucketPositions: {
            lps: number
            index: number
          }[]
        }[]
      }
    }>
    getAjnaClaimedRewards: SubgraphBaseResponse<{ claimeds: AjnaClaimedReward[] }>
    searchAjnaPool: SubgraphBaseResponse<{
      pools: SearchAjnaPoolResponse[]
    }>
  }
  Aave: {
    getAaveHistory: SubgraphBaseResponse<{
      positionEvents: AavePositionHistoryResponse[]
    }>
  }
  TempGraph: {
    tempMethod: SubgraphBaseResponse<undefined>
  }
  Referral: {
    getClaimedReferralRewards: SubgraphBaseResponse<{
      claimeds: ClaimedReferralRewards[]
    }>
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
    [NetworkIds.BASEMAINNET]: ''
    [NetworkIds.BASEGOERLI]: ''
    [NetworkIds.EMPTYNET]: ''
  }
}
export type SubgraphMethodsRecord = {
  [key in keyof (Subgraphs['Aave'] &
    Subgraphs['Ajna'] &
    Subgraphs['TempGraph'] &
    Subgraphs['Referral'])]: string
}
