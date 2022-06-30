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
        requestedTimestamp
      }
    }
  }
`

const makerOraclePriceInMultipleDates = gql`
  mutation pricesInDates($token: String!, $dates: [Datetime!]!) {
    makerOracleTokenPricesInDates(input: { token: $token, dates: $dates }) {
      tokenPrices {
        price
        token
        timestamp
        requestedTimestamp
      }
    }
  }
`

export interface MakerOracleTokenPrice {
  token: string
  price: BigNumber
  timestamp: moment.Moment
  requestedTimestamp: moment.Moment
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
        requestedTimestamp: moment(respRaw.requestedTimestamp),
      }
    }),
  )
}

export function createMakerOracleTokenPricesForDates$(
  context$: Observable<Context>,
  token: string,
  timestamps: moment.Moment[],
): Observable<MakerOracleTokenPrice> {
  return context$.pipe(
    first(),
    switchMap(({ cacheApi }) => {
      const apiClient = new GraphQLClient(cacheApi)
      return apiClient.request(makerOraclePriceInMultipleDates, {
        token,
        dates: timestamps.map((t) => t.toISOString()),
      })
    }),
    map((apiResponse) => {
      return apiResponse.makerOracleTokenPricesInDates.tokenPrices.map((resp: any) => ({
        token: resp.token,
        price: new BigNumber(resp.price),
        timestamp: moment(resp.timestamp),
        requestedTimestamp: moment(resp.requestedTimestamp),
      }))
    }),
  )
}
