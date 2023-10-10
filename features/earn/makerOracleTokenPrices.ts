import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import { gql, GraphQLClient } from 'graphql-request'
import type { Observable } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'

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
  timestamp: dayjs.Dayjs
  requestedTimestamp: dayjs.Dayjs
}

export function createMakerOracleTokenPrices$(
  context$: Observable<Context>,
  token: string,
  timestamp: dayjs.Dayjs,
): Observable<MakerOracleTokenPrice> {
  return context$.pipe(
    first(),
    switchMap(({ chainId }) => {
      const apiClient = new GraphQLClient(getNetworkContracts(NetworkIds.MAINNET, chainId).cacheApi)
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
        timestamp: dayjs(respRaw.timestamp),
        requestedTimestamp: dayjs(respRaw.requestedTimestamp),
      }
    }),
  )
}

export function createMakerOracleTokenPricesForDates$(
  context$: Observable<Context>,
  token: string,
  timestamps: dayjs.Dayjs[],
): Observable<MakerOracleTokenPrice> {
  return context$.pipe(
    first(),
    switchMap(({ chainId }) => {
      const apiClient = new GraphQLClient(getNetworkContracts(NetworkIds.MAINNET, chainId).cacheApi)
      return apiClient.request(makerOraclePriceInMultipleDates, {
        token,
        dates: timestamps.map((t) => t.toISOString()),
      })
    }),
    map((apiResponse) => {
      return apiResponse.makerOracleTokenPricesInDates.tokenPrices.map((resp: any) => ({
        token: resp.token,
        price: new BigNumber(resp.price),
        timestamp: dayjs(resp.timestamp),
        requestedTimestamp: dayjs(resp.requestedTimestamp),
      }))
    }),
  )
}
