import { Subgraphs, SubgraphsRecord } from 'features/subgraphLoader/types'
import { gql } from 'graphql-request'

export const subgraphsRecord: SubgraphsRecord = {
  Ajna: 'https://api.thegraph.com/subgraphs/name/halaprix/gajna',
  TempGraph: '',
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
  tempMethod: '',
}
