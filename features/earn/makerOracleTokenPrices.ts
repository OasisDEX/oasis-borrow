import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import moment from 'moment'
import { Observable } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'

import { Context } from '../../blockchain/network'

const makerOraclePrice = gql`
  mutation prices($token: String!, $date: Datetime) {
    makerOracleTokenPrices(input: { token: $token, date: $date }) {
      tokenPrice {
        token
        price
        timestamp
      }
    }
  }
`

export interface MakerOracleTokenPrice {
  token: string
  price: BigNumber
  timestamp: moment.Moment
}

export function createMakerOracleTokenPrices$(
  context$: Observable<Context>,
  token: string,
  timestamp: moment.Moment,
): Observable<MakerOracleTokenPrice> {
  return context$.pipe(
    first(),
    switchMap(({ cacheApi }) => {
      const apiClient = new GraphQLClient(cacheApi)
      return apiClient.request(makerOraclePrice, {
        token,
        date: timestamp.toISOString(),
      })
    }),
    map((apiResponse) => {
      const respRaw = apiResponse.makerOracleTokenPrices.tokenPrice
      return {
        token: respRaw.token,
        price: new BigNumber(respRaw.price),
        timestamp: moment(respRaw.timestamp),
      }
    }),
  )
}
