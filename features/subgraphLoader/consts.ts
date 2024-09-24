import { NetworkIds } from 'blockchain/networks'
import type { SubgraphMethodsRecord, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'

/**
 * Record of subgraphs for different features.
 */
export const subgraphsRecord: SubgraphsRecord = {
  SummerDpm: {
    [NetworkIds.MAINNET]: 'summer-dpm',
    [NetworkIds.HARDHAT]: 'summer-dpm',
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: 'summer-dpm-arbitrum',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'summer-dpm-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: 'summer-dpm-optimism',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
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
    [NetworkIds.BASEMAINNET]: 'summer-morpho-blue-base',
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
  Automation: {
    [NetworkIds.MAINNET]: 'summer-automation',
    [NetworkIds.HARDHAT]: 'summer-automation',
    [NetworkIds.GOERLI]: '',
    [NetworkIds.ARBITRUMMAINNET]: 'summer-automation-arbitrum',
    [NetworkIds.ARBITRUMGOERLI]: '',
    [NetworkIds.BASEMAINNET]: 'summer-automation-base',
    [NetworkIds.BASEGOERLI]: '',
    [NetworkIds.POLYGONMAINNET]: '',
    [NetworkIds.POLYGONMUMBAI]: '',
    [NetworkIds.OPTIMISMMAINNET]: 'summer-automation-optimism',
    [NetworkIds.OPTIMISMGOERLI]: '',
    [NetworkIds.EMPTYNET]: '',
  },
}

export const subgraphMethodsRecord: SubgraphMethodsRecord = {
  getUserCreateEvents: gql`
    query getUserCreateEvents($positionId: BigInt) {
      accounts(where: { vaultId: $positionId }) {
        createEvents {
          collateralToken
          debtToken
          positionType
          protocol
        }
        id
        user {
          id
        }
      }
    }
  `,
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
          amountUSD
          token
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
        apr7dAverage
        lendApr30dAverage
        lendApr7dAverage
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
        borrowApr
        quoteToken {
          symbol
        }
        collateralToken {
          symbol
        }
        buckets {
          price
          index
          quoteTokens
          collateral
          bucketLPs
        }
        collateralAddress
        dailyPercentageRate30dAverage
        debt
        depositSize
        htp
        htpIndex
        interestRate
        lendApr
        lup
        lupIndex
        poolMinDebtAmount
        quoteTokenAddress
        summerDepositAmountEarningInterest
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
      $protocol: String
    ) {
      positions(
        where: {
          account: $dpmProxyAddress
          collateralAddress: $collateralAddress
          debtAddress: $quoteAddress
          protocol: $protocol
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
          position_: { protocol: $protocol }
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
  getMorphoVauldIdPositions: gql`
    query getMorphoVauldIdPositions($positionId: BigInt) {
      accounts(where: { vaultId: $positionId }) {
        borrowPositions {
          market {
            id
            collateralToken {
              address
              symbol
            }
            debtToken {
              address
              symbol
            }
          }
        }
        id
        positionType
        protocol
        user {
          id
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
        creator
        ilk {
          id
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
        debtDelta
        collateralDelta
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
      positions(where: { account: $dpmProxyAddress, vault: $vault }) {
        id
        shares
        earnCumulativeFeesUSD
        earnCumulativeDepositUSD
        earnCumulativeWithdrawUSD
        earnCumulativeFeesInQuoteToken
        earnCumulativeDepositInQuoteToken
        earnCumulativeWithdrawInQuoteToken
      }
      vaults(where: { id: $vault }) {
        interestRates(orderBy: timestamp, orderDirection: desc, first: 30) {
          timestamp
          rate
        }
        totalAssets
        totalShares
      }
    }
  `,
  getErc4626PositionAggregatedData: gql`
    query Erc4626AggregatedData($vault: String!, $dpmProxyAddress: String!) {
      summerEvents(
        where: { account: $dpmProxyAddress, vault: $vault }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        kind
        quoteToken {
          id
          address
        }
        isOpen
        depositedUSD
        depositedInQuoteToken
        depositTransfers {
          id
          priceInUSD
          token
          from
          to
          amount
          amountUSD
          txHash
        }
        withdrawnUSD
        withdrawnInQuoteToken
        withdrawTransfers {
          id
          priceInUSD
          token
          from
          to
          amount
          amountUSD
          txHash
        }
        quoteToken {
          id
          address
          decimals
          symbol
        }
        quoteAddress
        quoteBefore
        quoteAfter
        quoteDelta
        quoteTokenPriceUSD
        swapToToken
        swapToAmount
        swapFromToken
        swapFromAmount
        gasFeeInQuoteToken
        marketPrice
        oasisFeeToken
        oasisFee
        oasisFeeUSD
        oasisFeeInQuoteToken
        gasUsed
        gasPrice
        gasFeeUSD
        gasFeeInQuoteToken
        totalFee
        totalFeeUSD
        totalFeeInQuoteToken
        ethPrice
        timestamp
        blockNumber
        txHash
      }
    }
  `,
  getErc4626InterestRates: gql`
    query getInterestRates($vault: String!) {
      vaults(where: { id: $vault }) {
        interestRates(orderBy: timestamp, orderDirection: desc, first: 7) {
          rate
        }
      }
    }
  `,
  getErc4626DpmPositions: gql`
    query getInterestRates($dpmProxyAddress: [String!]) {
      positions(where: { account_in: $dpmProxyAddress }) {
        account {
          address
          user {
            id
          }
          vaultId
        }
        vault {
          asset {
            address
            decimals
            symbol
          }
          id
        }
      }
    }
  `,
  getAutomationEvents: gql`
    query getAutomationEvents(
      $dpmProxyAddress: ID!
      $collateralAddress: String!
      $debtAddress: String!
    ) {
      triggerEvents(
        where: {
          account: $dpmProxyAddress
          trigger_: { decodedData_contains: [$collateralAddress, $debtAddress] }
        }
      ) {
        eventType
        transaction
        timestamp
        trigger {
          kind
          simpleName
          tokens {
            symbol
            address
          }
          decodedData
          decodedDataNames
        }
      }
    }
  `,
  getOsm: gql`
    query getOsm($id: ID!, $block: Int!) {
      osm(id: $id, block: { number: $block }) {
        value
      }
    }
  `,
  getMakerHistoryOld: gql`
    query getMakerHistoryOld($cdpId: Int!) {
      cdps(where: { cdp: $cdpId }) {
        stateLogs {
          kind
          collateralBefore
          collateralAfter
          collateralDiff
          debtBefore
          debtAfter
          debtDiff
          normalizedDebtBefore
          normalizedDebtAfter
          normalizedDebtDiff
          beforeMultiple
          afterMultiple
          liquidationPriceBefore
          liquidationPriceAfter
          collRatioBefore
          collRatioAfter
          rate
          oraclePrice
          multipleDiff
          collRatioDiff
          oazoFee
          loadFee
          gasFee
          totalFee
          netValue
          marketPrice
          collateralMarketPrice
          logIndex
          tab
          flip
          bought
          sold
          depositCollateral
          depositDai
          withdrawnCollateral
          withdrawnDai
          exitCollateral
          exitDai
          debt
          lockedCollateral
          block
          timestamp
          transaction
        }
      }
    }
  `,
  getMakerTriggersOld: gql`
    query getMakerTriggersOld($cdpId: Int!) {
      cdps(where: { cdp: $cdpId }) {
        triggers {
          id
          commandAddress
          triggerData
        }
      }
    }
  `,
  getMakerAutomationEvents: gql`
    query getAutomationEvents($cdpId: ID!) {
      triggerEvents(where: { trigger_: { cdpId: $cdpId } }) {
        eventType
        transaction
        timestamp
        trigger {
          kind
          simpleName
          tokens {
            symbol
            address
          }
          decodedData
          decodedDataNames
          triggerData
          commandAddress
        }
      }
    }
  `,
}
