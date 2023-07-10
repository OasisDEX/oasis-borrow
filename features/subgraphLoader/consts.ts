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
  getEarnData: gql`
    query getAccount($dpmProxyAddress: ID!) {
      account(id: $dpmProxyAddress) {
        earnPositions {
          lps
          index
          nft {
            id
          }
          account {
            cumulativeDeposit
            cumulativeFees
            cumulativeWithdraw
          }
        }
      }
    }
  `,
  getPoolData: gql`
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
  getPoolsTableData: gql`
    {
      pools {
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
  getNftIds: gql`
    query getNfts($walletAddress: ID!) {
      nfts(where: { user_: { id: $walletAddress }, staked: true }) {
        id
        staked
        currentReward
      }
    }
  `,
  getPositionAuction: gql`
    query getPositionAuction($dpmProxyAddress: ID!) {
      auctions(where: { account_: { id: $dpmProxyAddress } }) {
        inLiquidation
        alreadyTaken
        endOfGracePeriod
        debtToCover
        collateral
      }
    }
  `,
  getHistory: gql`
    query getHistory($dpmProxyAddress: ID!) {
      oasisEvents(where: { account_: { id: $dpmProxyAddress } }) {
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
  tempMethod: '',
}
