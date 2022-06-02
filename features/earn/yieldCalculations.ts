import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import { IlkData } from '../../blockchain/ilks'
import { Context } from '../../blockchain/network'
import { fetchWithOperationId } from '../vaultHistory/vaultHistory'

const historicalPriceQuery = gql`
  query prices($token: String!) {
    allHistoricTokenPrices(filter: { token: { equalTo: $token } }, orderBy: [TIMESTAMP_DESC]) {
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

export enum YieldPeriod {
  Yield7Days,
  Yield30Days,
  Yield90Days,
}

export interface Yield {
  ilk: string
  yields: {
    [key in YieldPeriod]?: {
      days: number
      value: BigNumber
    }
  }
}

export function getYields$(
  context$: Observable<Context>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<Yield> {
  const createClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )

  return combineLatest(context$, ilkData$(ilk)).pipe(
    switchMap(([{ cacheApi }, { ilk, token, stabilityFee }]) => {
      const apiClient = createClient(cacheApi)
      return combineLatest(getPrices(apiClient, token), of({ ilk, stabilityFee }))
    }),
    map(([prices, { ilk, stabilityFee }]) => {
      const result = [
        { period: YieldPeriod.Yield7Days, days: 7, price: prices.price7 },
        { period: YieldPeriod.Yield30Days, days: 30, price: prices.price30 },
        { period: YieldPeriod.Yield90Days, days: 90, price: prices.price90 },
      ]

      return result
        .map(({ period, days, price }) => {
          const value = calculateYield(price, prices.price, stabilityFee, days, 50)
          return { period, days, value }
        })
        .reduce(
          (acc, { period, days, value }) => {
            return {
              ...acc,
              yields: {
                ...acc.yields,
                [period]: {
                  days: days,
                  value: value,
                },
              },
            }
          },
          { ilk: ilk, yields: {} },
        )
    }),
    catchError(() => of({ ilk: ilk, yields: {} })),
  )
}

interface HistoricalTokenPricesApiResponse {
  token: string
  price: number
  price7: number
  price30: number
  price90: number
}

async function getPrices(
  client: GraphQLClient,
  ilk: string,
): Promise<HistoricalTokenPricesApiResponse> {
  const data = await client.request(historicalPriceQuery, { token: ilk })
  return data.allHistoricTokenPrices.nodes[0]
}

function calculateYield(
  startPrice: number,
  endPrice: number,
  stabilityFee: BigNumber,
  days: number,
  multiply: number,
): BigNumber {
  const { start, end } = { start: new BigNumber(startPrice), end: new BigNumber(endPrice) }

  const priceIncreasePercentage = end.minus(start).div(start)
  const percentageYieldFromPriceIncreasePeriod = priceIncreasePercentage
    .times(multiply)
    .times(365 / days)

  const feeForYear = stabilityFee.times(multiply - 1)

  return percentageYieldFromPriceIncreasePeriod.minus(feeForYear)
}
