import { gql, GraphQLClient } from 'graphql-request'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { Context } from '../../blockchain/network'

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

export interface HistoricalTokenPricesApiResponse {
  token: string
  price: string
  price7: string
  price30: string
  price90: string
}

export function createMakerOracleTokenPrices$(
  context$: Observable<Context>,
  token: string,
): Observable<HistoricalTokenPricesApiResponse> {
  return context$.pipe(
    switchMap(({ cacheApi }) => {
      const apiClient = new GraphQLClient(cacheApi)
      return apiClient.request(historicalPriceQuery, { token })
    }),
    map((apiResponse) => apiResponse.allHistoricTokenPrices.nodes[0]),
  )
}
