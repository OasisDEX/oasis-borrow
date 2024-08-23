import type { EarnCumulativesRawData, LendingCumulativesRawData } from '@oasisdex/dma-library'
import type { AjnaRewardsSource } from '@prisma/client'
import type { NetworkIds } from 'blockchain/networks'
import type {
  SearchAjnaPoolFilters,
  SearchAjnaPoolResponse,
} from 'features/ajna/pool-finder/helpers'
import type {
  MorphoVauldIdPositionsResponse,
  UserCreateEventsResponse,
} from 'features/omni-kit/observables'
import type { AjnaPoolDataResponse } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaPoolsDataResponse } from 'features/omni-kit/protocols/ajna/helpers/getAjnaPoolsData'
import type {
  AjnaBorrowerEventsResponse,
  AjnaHistoryResponse,
} from 'features/omni-kit/protocols/ajna/history/types'
import type { Erc4626PositionParametersResponse } from 'features/omni-kit/protocols/erc-4626/helpers'
import type { Erc4626SummerEventsResponse } from 'features/omni-kit/protocols/erc-4626/history/types'
import type { MorphoBorrowerEventsResponse } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type {
  AaveCumulativesResponse,
  AavePositionHistoryResponse,
  PositionHistoryResponse,
  TriggerEvent,
} from 'features/positionHistory/types'
import type { ClaimedReferralRewards } from 'features/referralOverview/getClaimedReferralRewards.types'
import type { GetAaveLikeInterestRatesResponse } from 'features/refinance/graph/getRefinanceTargetInterestRates'
import type { AjnaDpmPositionsResponse } from 'handlers/portfolio/positions/handlers/ajna/types'
import type { Erc4626DpmPositionsResponse } from 'handlers/portfolio/positions/handlers/erc-4626/types'
import type {
  MakerDiscoverPositionsResponse,
  MakerOracleResponse,
  MakerPositionsResponse,
} from 'handlers/portfolio/positions/handlers/maker/types'
import type { MorphoDpmPositionsResponse } from 'handlers/portfolio/positions/handlers/morpho-blue/types'
import type { Erc4626InterestRatesResponse } from 'handlers/product-hub/update-handlers/erc-4626/erc4626Handler'

export type Subgraphs = {
  SummerDpm: {
    getUserCreateEvents: { positionId: number }
  }
  SummerEvents: {
    getMakerSummerEvents: { positionId: number }
  }
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
    getAaveHistory: {
      dpmProxyAddress: string
      collateralAddress: string
      quoteAddress: string
      protocol: string
    }
  }
  Discover: {
    getMakerDiscoverPositions: { walletAddress: string }
    getMakerPosition: { cdpId: string; ilkId: string }
    getMakerOracle: { ilkId: string }
  }
  Morpho: {
    getMorphoVauldIdPositions: { positionId: number }
    getMorphoDpmPositions: { dpmProxyAddress: string[] }
    getMorphoPositionAggregatedData: {
      dpmProxyAddress: string
      collateralAddress: string
      quoteAddress: string
    }
    getMorphoCumulatives: { dpmProxyAddress: string; marketId: string }
  }
  Erc4626: {
    getErc4626PositionParameters: { vault: string; dpmProxyAddress: string }
    getErc4626PositionAggregatedData: { vault: string; dpmProxyAddress: string }
    getErc4626InterestRates: { vault: string }
    getErc4626DpmPositions: { dpmProxyAddress: string[] }
  }
  Referral: {
    getClaimedReferralRewards: { walletAddress: string }
  }
  Automation: {
    getAutomationEvents: {
      dpmProxyAddress: string
      collateralAddress: string
      debtAddress: string
    }
  }
}

export type SubgraphBaseResponse<R> = {
  success: boolean
  error: unknown
  response: R
}

export type SubgraphsResponses = {
  SummerDpm: {
    getUserCreateEvents: SubgraphBaseResponse<UserCreateEventsResponse>
  }
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
        earnPositions: EarnCumulativesRawData[]
        borrowPositions: LendingCumulativesRawData[]
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
    getAaveLikeInterestRates: SubgraphBaseResponse<{
      [key: string]: GetAaveLikeInterestRatesResponse[]
    }>
  }
  Discover: {
    getMakerDiscoverPositions: SubgraphBaseResponse<MakerDiscoverPositionsResponse>
    getMakerPosition: SubgraphBaseResponse<MakerPositionsResponse>
    getMakerOracle: SubgraphBaseResponse<MakerOracleResponse>
  }
  Morpho: {
    getMorphoVauldIdPositions: SubgraphBaseResponse<MorphoVauldIdPositionsResponse>
    getMorphoDpmPositions: SubgraphBaseResponse<MorphoDpmPositionsResponse>
    getMorphoPositionAggregatedData: SubgraphBaseResponse<{
      summerEvents: PositionHistoryResponse[]
      borrowerEvents: MorphoBorrowerEventsResponse[]
    }>
    getMorphoCumulatives: SubgraphBaseResponse<{
      account: {
        borrowPositions: LendingCumulativesRawData[]
      }
    }>
  }
  Erc4626: {
    getErc4626PositionParameters: SubgraphBaseResponse<Erc4626PositionParametersResponse>
    getErc4626PositionAggregatedData: SubgraphBaseResponse<Erc4626SummerEventsResponse>
    getErc4626InterestRates: SubgraphBaseResponse<Erc4626InterestRatesResponse>
    getErc4626DpmPositions: SubgraphBaseResponse<Erc4626DpmPositionsResponse>
  }
  Referral: {
    getClaimedReferralRewards: SubgraphBaseResponse<{
      claimeds: ClaimedReferralRewards[]
    }>
  }
  Automation: {
    getAutomationEvents: SubgraphBaseResponse<{ triggerEvents: TriggerEvent[] }>
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
  [key in keyof (Subgraphs['SummerDpm'] &
    Subgraphs['SummerEvents'] &
    Subgraphs['Ajna'] &
    Subgraphs['Aave'] &
    Subgraphs['Discover'] &
    Subgraphs['Morpho'] &
    Subgraphs['Erc4626'] &
    Subgraphs['Automation'] &
    Subgraphs['Referral'])]: string
}
