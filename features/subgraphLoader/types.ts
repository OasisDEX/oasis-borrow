import type { NetworkIds } from 'blockchain/networks'
import type {
  SearchAjnaPoolFilters,
  SearchAjnaPoolResponse,
} from 'features/ajna/pool-finder/helpers'
import type { AjnaClaimedReward } from 'features/ajna/rewards/helpers'
import type { AjnaPoolDataResponse } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaPoolsDataResponse } from 'features/omni-kit/protocols/ajna/helpers/getAjnaPoolsData'
import type {
  AjnaBorrowerEventsResponse,
  AjnaHistoryResponse,
} from 'features/omni-kit/protocols/ajna/history/types'
import type { AavePositionHistoryResponse } from 'features/positionHistory/types'
import type { ClaimedReferralRewards } from 'features/referralOverview/getClaimedReferralRewards.types'
import type { AjnaDpmPositionsResponse } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { MakerDiscoverPositionsResponse } from 'handlers/portfolio/positions/handlers/maker/types'

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
    getAjnaDpmPositions: { dpmProxyAddress: string[] }
    searchAjnaPool: {
      where: SearchAjnaPoolFilters
    }
  }
  Aave: {
    getAaveHistory: { dpmProxyAddress: string }
  }
  Discover: {
    getMakerDiscoverPositions: { walletAddress: string }
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
    getAjnaDpmPositions: SubgraphBaseResponse<AjnaDpmPositionsResponse>
    searchAjnaPool: SubgraphBaseResponse<{
      pools: SearchAjnaPoolResponse[]
    }>
  }
  Aave: {
    getAaveHistory: SubgraphBaseResponse<{
      positionEvents: AavePositionHistoryResponse[]
    }>
  }
  Discover: {
    getMakerDiscoverPositions: SubgraphBaseResponse<MakerDiscoverPositionsResponse>
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
    [NetworkIds.ARBITRUMMAINNET]: string
    [NetworkIds.ARBITRUMGOERLI]: string
    [NetworkIds.POLYGONMAINNET]: string
    [NetworkIds.POLYGONMUMBAI]: string
    [NetworkIds.OPTIMISMMAINNET]: string
    [NetworkIds.OPTIMISMGOERLI]: string
    [NetworkIds.BASEMAINNET]: string
    [NetworkIds.BASEGOERLI]: string
    [NetworkIds.EMPTYNET]: string
  }
}
export type SubgraphMethodsRecord = {
  [key in keyof (Subgraphs['Aave'] &
    Subgraphs['Ajna'] &
    Subgraphs['Discover'] &
    Subgraphs['TempGraph'] &
    Subgraphs['Referral'])]: string
}
