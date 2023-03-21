import { NetworkIds } from 'blockchain/networkIds'
import { Subgraphs, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'
import getConfig from 'next/config'

export const subgraphsRecord: SubgraphsRecord = {
  Ajna: {
    [NetworkIds.MAINNET]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrl,
    [NetworkIds.HARDHAT]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrl,
    [NetworkIds.GOERLI]: getConfig()?.publicRuntimeConfig?.ajnaSubgraphUrlGoerli,
  },
  TempGraph: {
    [NetworkIds.MAINNET]: '',
    [NetworkIds.HARDHAT]: '',
    [NetworkIds.GOERLI]: '',
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
      }
    }
  `,
  tempMethod: '',
}
