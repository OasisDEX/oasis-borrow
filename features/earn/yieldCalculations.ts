import BigNumber from 'bignumber.js'
import { gql, GraphQLClient } from 'graphql-request'
import { isEqual, memoize } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { IlkData } from '../../blockchain/ilks'
import { Context } from '../../blockchain/network'
import { one } from '../../helpers/zero'
import { fetchWithOperationId } from '../vaultHistory/vaultHistory'

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

export const SupportedIlkForYieldsCalculations = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A']

export function getYields$(
  context$: Observable<Context>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<Yield> {
  if (!SupportedIlkForYieldsCalculations.includes(ilk)) {
    return of({ ilk: ilk, yields: {} })
  }

  const createClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )

  return combineLatest(context$, ilkData$(ilk)).pipe(
    switchMap(([{ cacheApi }, { ilk, token, stabilityFee, liquidationRatio }]) => {
      const apiClient = createClient(cacheApi)
      return combineLatest(getPrices(apiClient, token), of({ ilk, stabilityFee, liquidationRatio }))
    }),
    map(([prices, { ilk, stabilityFee, liquidationRatio }]) => {
      const result = [
        { period: YieldPeriod.Yield7Days, days: 7, price: prices.price7 },
        { period: YieldPeriod.Yield30Days, days: 30, price: prices.price30 },
        { period: YieldPeriod.Yield90Days, days: 90, price: prices.price90 },
      ]

      return result
        .map(({ period, days, price }) => {
          const multiply = one.div(liquidationRatio.minus(one))
          const value = calculateYield(
            new BigNumber(price),
            new BigNumber(prices.price),
            stabilityFee,
            days,
            multiply,
          )
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
    distinctUntilChanged(isEqual),
  )
}

interface HistoricalTokenPricesApiResponse {
  token: string
  price: string
  price7: string
  price30: string
  price90: string
}

async function getPrices(
  client: GraphQLClient,
  token: string,
): Promise<HistoricalTokenPricesApiResponse> {
  const data = await client.request(historicalPriceQuery, { token: token })
  return data.allHistoricTokenPrices.nodes[0]
}

export function calculateYield(
  startPrice: BigNumber,
  endPrice: BigNumber,
  stabilityFee: BigNumber,
  days: number,
  multiply: BigNumber,
): BigNumber {
  const priceIncreasePercentage = endPrice.minus(startPrice).div(startPrice)
  const percentageYieldFromPriceIncreasePeriod = priceIncreasePercentage
    .times(multiply)
    .times(365 / days)

  const feeForYear = stabilityFee.times(multiply.minus(1))

  return percentageYieldFromPriceIncreasePeriod.minus(feeForYear)
}
