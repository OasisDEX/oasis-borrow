import { gql, GraphQLClient } from 'graphql-request'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { Context } from '../../blockchain/network'
import BigNumber from 'bignumber.js'

const historicalPriceQuery = gql`
  query prices($token: String!) {
    allHistoricTokenPrices(filter: { token: { equalTo: $token } }) {
      nodes {
        token
        price
        price7
        price30
        price90
      }
    }
  }
`

export interface HistoricalTokenPrices {
  token: string
  price: BigNumber
  price7: BigNumber
  price30: BigNumber
  price90: BigNumber
}

export function createMakerOracleTokenPrices$(
  context$: Observable<Context>,
  token: string,
): Observable<HistoricalTokenPrices> {
  return context$.pipe(
    switchMap(({ cacheApi }) => {
      const apiClient = new GraphQLClient(cacheApi)
      return apiClient.request(historicalPriceQuery, { token })
    }),
    map((apiResponse) => {
      const respRaw = apiResponse.allHistoricTokenPrices.nodes[0]
      return {
        token: respRaw.token,
        price: new BigNumber(respRaw.price),
        price7: new BigNumber(respRaw.price7),
        price30: new BigNumber(respRaw.price30),
        price90: new BigNumber(respRaw.price90),
      }
    }),
  )
}
