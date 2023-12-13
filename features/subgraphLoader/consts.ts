import { NetworkIds } from 'blockchain/networks'
import type { SubgraphMethodsRecord, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'

/**
 * Record of subgraphs for different features.
 */
export const subgraphsRecord: SubgraphsRecord = {
  Ajna: {
    [NetworkIds.MAINNET]: 'summer/ajna-v2',
    [NetworkIds.HARDHAT]: 'summer/ajna-v2',
    [NetworkIds.GOERLI]: 'summer/ajna-v2',
    [NetworkIds.ARBITRUMMAINNET]: '',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'summer/ajna-v2-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: '',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
  Aave: {
    [NetworkIds.MAINNET]: 'oasis/oasis-history',
    [NetworkIds.HARDHAT]: 'oasis/oasis-history',
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: 'oasis/oasis-history-arbitrum',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'oasis/oasis-history-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: 'oasis/oasis-history-optimism',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },

  Discover: {
    [NetworkIds.MAINNET]: `oasis/discover`,
    [NetworkIds.HARDHAT]: `oasis/discover`,
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: '',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: '',
    [NetworkIds.BASEGOERLI]: '',
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
    [NetworkIds.BASEMAINNET]: '',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: '',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
  Referral: {
    [NetworkIds.MAINNET]: 'summer/referrals',
    [NetworkIds.HARDHAT]: 'summer/referrals',
    [NetworkIds.GOERLI]: 'summer/referrals',
    [NetworkIds.ARBITRUMMAINNET]: 'summer/referrals',
    [NetworkIds.ARBITRUMGOERLI]: 'summer/referrals',
    [NetworkIds.POLYGONMAINNET]: 'summer/referrals',
    [NetworkIds.POLYGONMUMBAI]: 'summer/referrals',
    [NetworkIds.OPTIMISMMAINNET]: 'summer/referrals',
    [NetworkIds.OPTIMISMGOERLI]: 'summer/referrals',
    [NetworkIds.BASEMAINNET]: 'summer/referrals',
    [NetworkIds.BASEGOERLI]: 'summer/referrals',
    [NetworkIds.EMPTYNET]: '',
  },
}

export const subgraphMethodsRecord: SubgraphMethodsRecord = {
  getAjnaPositionAggregatedData: gql`
    query getAccount($dpmProxyAddress: ID!, $collateralAddress: String!, $quoteAddress: String!) {
      auctions(where: { account_: { id: $dpmProxyAddress } }) {
        inLiquidation
        alreadyTaken
        debtToCover
        collateral
      }
      borrowerEvents(
        where: {
          account_: { id: $dpmProxyAddress }
          collateralToken_: { address: $collateralAddress }
          debtToken_: { address: $quoteAddress }
        }
      ) {
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
      oasisEvents(
        where: {
          account_: { id: $dpmProxyAddress }
          collateralToken_: { address: $collateralAddress }
          debtToken_: { address: $quoteAddress }
        }
      ) {
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
  getAjnaCumulatives: gql`
    query getAccount($dpmProxyAddress: ID!, $poolAddress: String!) {
      account(id: $dpmProxyAddress) {
        earnPositions(where: { pool: $poolAddress }) {
          earnCumulativeFeesInQuoteToken
          earnCumulativeQuoteTokenDeposit
          earnCumulativeQuoteTokenWithdraw
        }
        borrowPositions(where: { pool: $poolAddress }) {
          borrowCumulativeDepositUSD
          borrowCumulativeFeesUSD
          borrowCumulativeWithdrawUSD
        }
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
        lendApr
        borrowApr
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
        loansCount
        totalAuctionsInPool
        t0debt
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
    query getAccount($dpmProxyAddress: ID!, $poolAddress: String!) {
      account(id: $dpmProxyAddress) {
        vaultId
        address
        earnPositions(where: { pool: $poolAddress }) {
          id
          earnCumulativeFeesInQuoteToken
          earnCumulativeQuoteTokenDeposit
          earnCumulativeQuoteTokenWithdraw
          bucketPositions(where: { lps_gt: 0 }) {
            lps
            index
          }
        }
      }
    }
  `,
  getAjnaClaimedRewards: gql`
    query getClaimed($walletAddress: ID!) {
      claimeds(where: { user: $walletAddress }) {
        week {
          week
        }
      }
    }
  `,
  getAjnaDpmPositions: gql`
    query getDpmPositions($dpmProxyAddress: [String!]) {
      accounts(where: { address_in: $dpmProxyAddress }) {
        address
        borrowPositions {
          protocolEvents(first: 1, orderBy: timestamp, orderDirection: asc) {
            timestamp
          }
          pool {
            address
            collateralToken {
              symbol
              address
            }
            quoteToken {
              symbol
              address
            }
          }
        }
        earnPositions {
          protocolEvents(first: 1, orderBy: timestamp, orderDirection: asc) {
            timestamp
          }
          pool {
            address
            collateralToken {
              symbol
              address
            }
            quoteToken {
              symbol
              address
            }
          }
        }
        vaultId
      }
    }
  `,
  searchAjnaPool: gql`
    query searchPool($where: Pool_filter) {
      pools(first: 111, where: $where) {
        address
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
        collateralAddress
        collateralToken {
          symbol
        }
        debt
        interestRate
        lendApr
        lup
        lupIndex
        quoteTokenAddress
        quoteToken {
          symbol
        }
      }
    }
  `,
  getAaveHistory: gql`
    query AavePositionHistory($dpmProxyAddress: String) {
      positions(where: { account: $dpmProxyAddress }) {
        id
        cumulativeDeposit
        cumulativeWithdraw
        cumulativeFees
        cumulativeFeesInQuoteToken
        cumulativeDepositInQuoteToken
        cumulativeWithdrawInQuoteToken
        cumulativeDespositInCollateralToken
        cumulativeWithdrawInCollateralToken
      }
      positionEvents(where: { account: $dpmProxyAddress }) {
        depositTransfers {
          amount
          token
        }
        withdrawTransfers {
          amount
          token
        }
        blockNumber
        collateralAddress
        collateralAfter
        collateralBefore
        collateralDelta
        collateralOraclePrice
        collateralToken {
          symbol
        }
        collateralTokenPriceUSD
        debtAddress
        debtAfter
        debtBefore
        debtDelta
        debtOraclePrice
        debtToken {
          symbol
        }
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
        summerFee
        summerFeeToken
        summerFeeUSD
        swapFromAmount
        swapFromToken
        swapToAmount
        swapToToken
        timestamp
        totalFee
        txHash
        withdrawnUSD
        timestamp
        txHash
        blockNumber
        trigger {
          id
          decodedData
          decodedDataNames
        }
      }
    }
  `,
  getMakerDiscoverPositions: gql`
    query getDiscoverPositions($walletAddress: Bytes!) {
      cdps(where: { owner_: { address: $walletAddress } }) {
        cdp
        collateral
        cumulativeDepositUSD
        cumulativeFeesUSD
        cumulativeWithdrawnUSD
        ilk {
          ilk
          liquidationRatio
          pip {
            value
          }
          rate
          stabilityFee
          tokenSymbol
        }
        liquidationPrice
        normalizedDebt
        openedAt
        triggers {
          commandAddress
          executedBlock
          removedBlock
          triggerData
        }
        type
      }
    }
  `,
  tempMethod: '',
  getClaimedReferralRewards: gql`
    query getClaimed($walletAddress: String!) {
      claimeds(where: { user: $walletAddress }) {
        week {
          id
          week
        }
      }
    }
  `,
}
