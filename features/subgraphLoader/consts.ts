import { NetworkIds } from 'blockchain/networks'
import { Subgraphs, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'
import getConfig from 'next/config'

export const subgraphsRecord: SubgraphsRecord = {
  Ajna: {
    [NetworkIds.MAINNET]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrl,
    [NetworkIds.HARDHAT]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrl,
    [NetworkIds.GOERLI]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrlGoerli,
    [NetworkIds.ARBITRUMMAINNET]: '',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: '',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
  TempGraph: {
    [NetworkIds.MAINNET]: '',
    [NetworkIds.HARDHAT]: '',
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: '',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: '',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
}

export const subgraphMethodsRecord: {
  [key in keyof (Subgraphs['Ajna'] & Subgraphs['TempGraph'])]: string
} = {
  getAjnaPositionAggregatedData: gql`
    query getAccount($dpmProxyAddress: ID!) {
      account(id: $dpmProxyAddress) {
        cumulativeDeposit
        cumulativeFees
        cumulativeWithdraw
        earnCumulativeFeesInQuoteToken
        earnCumulativeQuoteTokenDeposit
        earnCumulativeQuoteTokenWithdraw
      }
      auctions(where: { account_: { id: $dpmProxyAddress } }) {
        inLiquidation
        alreadyTaken
        endOfGracePeriod
        debtToCover
        collateral
      }
      borrowerEvents(where: { account_: { id: $dpmProxyAddress } }) {
        id
        kind
        timestamp
        txHash
        settledDebt
        debtToCover
        collateralForLiquidation
        remainingCollateral
        auction {
          id
        }
      }
      oasisEvents(where: { account_: { id: $dpmProxyAddress } }) {
        depositTransfers {
          amount
        }
        withdrawTransfers {
          amount
        }
        blockNumber
        collateralAddress
        collateralAfter
        collateralBefore
        collateralDelta
        collateralOraclePrice
        collateralToken
        collateralTokenPriceUSD
        debtAddress
        debtAfter
        debtBefore
        debtDelta
        debtOraclePrice
        debtToken
        debtTokenPriceUSD
        depositedUSD
        ethPrice
        gasFeeUSD
        gasPrice
        gasUsed
        id
        kind
        liquidationPriceAfter
        liquidationPriceBefore
        ltvAfter
        ltvBefore
        marketPrice
        multipleAfter
        multipleBefore
        netValueAfter
        netValueBefore
        oasisFee
        oasisFeeToken
        oasisFeeUSD
        originationFee
        quoteTokensAfter
        quoteTokensBefore
        quoteTokensDelta
        quoteTokensMoved
        moveQuoteFromIndex
        moveQuoteToIndex
        addOrRemoveIndex
        isOpen
        swapFromAmount
        swapFromToken
        swapToAmount
        swapToToken
        timestamp
        totalFee
        txHash
        withdrawnUSD
      }
    }
  `,
  getAjnaPoolAddress: gql`
    query getPools($collateralAddress: ID!, $quoteAddress: ID!) {
      pools(where: { collateralAddress: $collateralAddress, quoteTokenAddress: $quoteAddress }) {
        address
      }
    }
  `,
  getAjnaPoolData: gql`
    query getPool($poolAddress: ID!) {
      pool(id: $poolAddress) {
        address
        collateralAddress
        quoteTokenAddress
        htp
        hpb
        lup
        htpIndex
        hpbIndex
        lupIndex
        momp
        debt
        depositSize
        interestRate
        apr30dAverage
        dailyPercentageRate30dAverage
        monthlyPercentageRate30dAverage
        poolMinDebtAmount
        poolCollateralization
        poolActualUtilization
        poolTargetUtilization
        currentBurnEpoch
        pendingInflator
        lendApr
        borrowApr
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
      }
    }
  `,
  getAjnaPoolsData: gql`
    {
      pools {
        address
        collateralAddress
        quoteTokenAddress
        dailyPercentageRate30dAverage
        debt
        depositSize
        interestRate
        poolMinDebtAmount
        lup
        lupIndex
        htp
        htpIndex
        lendApr
        borrowApr
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
      }
    }
  `,
  getAjnaEarnPositionData: gql`
    query getAccount($dpmProxyAddress: ID!) {
      account(id: $dpmProxyAddress) {
        earnPositions {
          lps
          index
          nft {
            id
          }
          account {
            earnCumulativeFeesInQuoteToken
            earnCumulativeQuoteTokenDeposit
            earnCumulativeQuoteTokenWithdraw
          }
        }
      }
    }
  `,
  getAjnaEarnPositionNftId: gql`
    query getNfts($walletAddress: ID!) {
      nfts(where: { user_: { id: $walletAddress }, staked: true }) {
        id
        staked
        currentReward
      }
    }
  `,
  getAjnaClaimedRewards: gql`
    query getClaimed($walletAddress: ID!) {
      claimeds(where: { user: $walletAddress }) {
        amount
      }
    }
  `,
  searchAjnaPool: gql`
    query searchPool($collateralAddress: [ID]!, $poolAddress: [ID]!, $quoteAddress: [ID]!) {
      pools(
        first: 111
        where: {
          or: [
            { address_in: $poolAddress }
            { collateralAddress_in: $collateralAddress }
            { quoteTokenAddress_in: $quoteAddress }
          ]
        }
      ) {
        address
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
        collateralAddress
        debt
        interestRate
        lendApr
        lup
        lupIndex
        quoteTokenAddress
      }
    }
  `,
  tempMethod: '',
}
