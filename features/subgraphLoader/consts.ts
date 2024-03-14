import { NetworkIds } from 'blockchain/networks'
import type { SubgraphMethodsRecord, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'

/**
 * Record of subgraphs for different features.
 */
export const subgraphsRecord: SubgraphsRecord = {
  Ajna: {
    [NetworkIds.MAINNET]: 'summer-ajna-v2',
    [NetworkIds.HARDHAT]: 'summer-ajna-v2',
    [NetworkIds.GOERLI]: 'summer-ajna-v2',
    [NetworkIds.ARBITRUMMAINNET]: 'summer-ajna-v2-arbitrum',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'summer-ajna-v2-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: 'summer-ajna-v2-optimism',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
  Aave: {
    [NetworkIds.MAINNET]: 'summer-oasis-history',
    [NetworkIds.HARDHAT]: 'summer-oasis-history',
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: 'summer-oasis-history-arbitrum',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'summer-oasis-history-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: 'summer-oasis-history-optimism',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
  Discover: {
    [NetworkIds.MAINNET]: `summer-discover`,
    [NetworkIds.HARDHAT]: `summer-discover`,
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
  Morpho: {
    [NetworkIds.MAINNET]: 'summer-morpho-blue',
    [NetworkIds.HARDHAT]: 'summer-morpho-blue',
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
  Erc4626: {
    [NetworkIds.MAINNET]: 'summer-lazy-vaults',
    [NetworkIds.HARDHAT]: 'summer-lazy-vaults',
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
    [NetworkIds.MAINNET]: 'summer-referrals-optimism',
    [NetworkIds.HARDHAT]: 'summer-referrals-optimism',
    [NetworkIds.GOERLI]: 'summer-referrals-optimism',
    [NetworkIds.ARBITRUMMAINNET]: 'summer-referrals-optimism',
    [NetworkIds.ARBITRUMGOERLI]: 'summer-referrals-optimism',
    [NetworkIds.POLYGONMAINNET]: 'summer-referrals-optimism',
    [NetworkIds.POLYGONMUMBAI]: 'summer-referrals-optimism',
    [NetworkIds.OPTIMISMMAINNET]: 'summer-referrals-optimism',
    [NetworkIds.OPTIMISMGOERLI]: 'summer-referrals-optimism',
    [NetworkIds.BASEMAINNET]: 'summer-referrals-optimism',
    [NetworkIds.BASEGOERLI]: 'summer-referrals-optimism',
    [NetworkIds.EMPTYNET]: '',
  },
}

export const subgraphMethodsRecord: SubgraphMethodsRecord = {
  getAjnaPositionAggregatedData: gql`
    query getAccount($dpmProxyAddress: ID!, $collateralAddress: String!, $quoteAddress: String!) {
      auctions(where: { account_: { id: $dpmProxyAddress } }) {
        inLiquidation
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
        interestRate
      }
    }
  `,
  getAjnaCumulatives: gql`
    query getAccount($dpmProxyAddress: ID!, $poolAddress: String!) {
      account(id: $dpmProxyAddress) {
        earnPositions(where: { pool: $poolAddress }) {
          earnCumulativeDepositUSD
          earnCumulativeDepositInQuoteToken
          earnCumulativeDepositInCollateralToken
          earnCumulativeWithdrawUSD
          earnCumulativeWithdrawInQuoteToken
          earnCumulativeWithdrawInCollateralToken
          earnCumulativeFeesUSD
          earnCumulativeFeesInQuoteToken
          earnCumulativeFeesInCollateralToken
          earnCumulativeQuoteTokenDeposit
          earnCumulativeQuoteTokenWithdraw
        }
        borrowPositions(where: { pool: $poolAddress }) {
          borrowCumulativeDepositUSD
          borrowCumulativeDepositInQuoteToken
          borrowCumulativeDepositInCollateralToken
          borrowCumulativeWithdrawUSD
          borrowCumulativeWithdrawInQuoteToken
          borrowCumulativeWithdrawInCollateralToken
          borrowCumulativeCollateralDeposit
          borrowCumulativeCollateralWithdraw
          borrowCumulativeDebtDeposit
          borrowCumulativeDebtWithdraw
          borrowCumulativeFeesUSD
          borrowCumulativeFeesInQuoteToken
          borrowCumulativeFeesInCollateralToken
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
        type
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
    query AavePositionHistory(
      $dpmProxyAddress: String
      $collateralAddress: String
      $quoteAddress: String
    ) {
      positions(
        where: {
          account: $dpmProxyAddress
          collateralAddress: $collateralAddress
          debtAddress: $quoteAddress
        }
      ) {
        id
        cumulativeDepositUSD
        cumulativeDepositInQuoteToken
        cumulativeDepositInCollateralToken
        cumulativeWithdrawUSD
        cumulativeWithdrawInQuoteToken
        cumulativeWithdrawInCollateralToken
        cumulativeFeesUSD
        cumulativeFeesInQuoteToken
        cumulativeFeesInCollateralToken
      }
      positionEvents(
        where: {
          account: $dpmProxyAddress
          collateralToken_: { address: $collateralAddress }
          debtToken_: { address: $quoteAddress }
        }
      ) {
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
  getMorphoDpmPositions: gql`
    query getDpmPositions($dpmProxyAddress: [String!]) {
      accounts(where: { address_in: $dpmProxyAddress }) {
        address
        borrowPositions {
          market {
            collateralToken {
              address
              decimals
              symbol
            }
            id
            latestInterestRates {
              rate
            }
            liquidationRatio
            debtToken {
              address
              decimals
              symbol
            }
          }
        }
        vaultId
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
  getMorphoPositionAggregatedData: gql`
    query getAccount($dpmProxyAddress: ID!, $collateralAddress: String!, $quoteAddress: String!) {
      summerEvents(
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
        quoteTokensAfter
        quoteTokensBefore
        quoteTokensDelta
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
        repaidAssets
        quoteRepaid
      }
    }
  `,
  getMorphoCumulatives: gql`
    query getAccount($dpmProxyAddress: ID!, $marketId: Bytes!) {
      account(id: $dpmProxyAddress) {
        borrowPositions(where: { market_: { id: $marketId } }) {
          borrowCumulativeDepositUSD
          borrowCumulativeDepositInQuoteToken
          borrowCumulativeDepositInCollateralToken
          borrowCumulativeWithdrawUSD
          borrowCumulativeWithdrawInQuoteToken
          borrowCumulativeWithdrawInCollateralToken
          borrowCumulativeCollateralDeposit
          borrowCumulativeCollateralWithdraw
          borrowCumulativeDebtDeposit
          borrowCumulativeDebtWithdraw
          borrowCumulativeFeesUSD
          borrowCumulativeFeesInQuoteToken
          borrowCumulativeFeesInCollateralToken
        }
      }
    }
  `,
  getErc4626PositionParameters: gql`
    query getPositionParameters($vault: String!, $dpmProxyAddress: String!) {
      positions(where: { vault: $vault, account: $dpmProxyAddress }) {
        id
        shares
        earnCumulativeFeesUSD
        earnCumulativeDepositUSD
        earnCumulativeWithdrawUSD
        earnCumulativeFeesInQuoteToken
        earnCumulativeDepositInQuoteToken
        earnCumulativeWithdrawInQuoteToken
        vault {
          interestRates(orderBy: timestamp, orderDirection: desc, first: 30) {
            timestamp
            rate
          }
          totalAssets
          totalShares
        }
      }
    }
  `,
}
