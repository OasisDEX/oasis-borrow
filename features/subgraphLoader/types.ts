import type { AjnaRewardsSource } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import type {
  SearchAjnaPoolFilters,
  SearchAjnaPoolResponse,
} from 'features/ajna/pool-finder/helpers'
import type { AjnaPoolDataResponse } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaPoolsDataResponse } from 'features/omni-kit/protocols/ajna/helpers/getAjnaPoolsData'
import type {
  AjnaBorrowerEventsResponse,
  AjnaHistoryResponse,
} from 'features/omni-kit/protocols/ajna/history/types'
import type {
  AaveCumulativesResponse,
  AavePositionHistoryResponse,
  PositionHistoryResponse,
} from 'features/positionHistory/types'
import type { ClaimedReferralRewards } from 'features/referralOverview/getClaimedReferralRewards.types'
import type { AjnaDpmPositionsResponse } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { MakerDiscoverPositionsResponse } from 'handlers/portfolio/positions/handlers/maker/types'
import type { MorphoDpmPositionsResponse } from 'handlers/portfolio/positions/handlers/morpho-blue/types'

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
  Morpho: {
    getMorphoDpmPositions: { dpmProxyAddress: string[] }
    getMorphoPositionAggregatedData: {
      dpmProxyAddress: string
      collateralAddress: string
      quoteAddress: string
    }
    getMorphoCumulatives: { dpmProxyAddress: string; marketId: string }
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
          earnCumulativeDepositUSD: number
          earnCumulativeDepositInQuoteToken: number
          earnCumulativeDepositInCollateralToken: number
          earnCumulativeWithdrawUSD: number
          earnCumulativeWithdrawInQuoteToken: number
          earnCumulativeWithdrawInCollateralToken: number
          earnCumulativeFeesUSD: number
          earnCumulativeFeesInQuoteToken: number
          earnCumulativeFeesInCollateralToken: number
          earnCumulativeQuoteTokenDeposit: number
          earnCumulativeQuoteTokenWithdraw: number
        }[]
        borrowPositions: {
          borrowCumulativeDepositUSD: number
          borrowCumulativeDepositInQuoteToken: number
          borrowCumulativeDepositInCollateralToken: number
          borrowCumulativeWithdrawUSD: number
          borrowCumulativeWithdrawInQuoteToken: number
          borrowCumulativeWithdrawInCollateralToken: number
          borrowCumulativeCollateralDeposit: number
          borrowCumulativeCollateralWithdraw: number
          borrowCumulativeDebtDeposit: number
          borrowCumulativeDebtWithdraw: number
          borrowCumulativeFeesUSD: number
          borrowCumulativeFeesInQuoteToken: number
          borrowCumulativeFeesInCollateralToken: number
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
    getAjnaClaimedRewards: SubgraphBaseResponse<{
      claimeds: {
        week: { week: number }
        type: AjnaRewardsSource
      }[]
    }>
    getAjnaDpmPositions: SubgraphBaseResponse<AjnaDpmPositionsResponse>
    searchAjnaPool: SubgraphBaseResponse<{
      pools: SearchAjnaPoolResponse[]
    }>
  }
  Aave: {
    getAaveHistory: SubgraphBaseResponse<{
      positionEvents: AavePositionHistoryResponse[]
      positions: AaveCumulativesResponse[] // we only call one position with very specific ID, but only positions (not position) is case insensitive
    }>
  }
  Discover: {
    getMakerDiscoverPositions: SubgraphBaseResponse<MakerDiscoverPositionsResponse>
  }
  Morpho: {
    getMorphoDpmPositions: SubgraphBaseResponse<MorphoDpmPositionsResponse>
    getMorphoPositionAggregatedData: SubgraphBaseResponse<{
      summerEvents: PositionHistoryResponse[]
    }>
    getMorphoCumulatives: SubgraphBaseResponse<{
      account: {
        borrowPositions: {
          borrowCumulativeDepositUSD: number
          borrowCumulativeDepositInQuoteToken: number
          borrowCumulativeDepositInCollateralToken: number
          borrowCumulativeWithdrawUSD: number
          borrowCumulativeWithdrawInQuoteToken: number
          borrowCumulativeWithdrawInCollateralToken: number
          borrowCumulativeCollateralDeposit: number
          borrowCumulativeCollateralWithdraw: number
          borrowCumulativeDebtDeposit: number
          borrowCumulativeDebtWithdraw: number
          borrowCumulativeFeesUSD: number
          borrowCumulativeFeesInQuoteToken: number
          borrowCumulativeFeesInCollateralToken: number
        }[]
      }
    }>
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
    Subgraphs['Morpho'] &
    Subgraphs['Referral'])]: string
}
