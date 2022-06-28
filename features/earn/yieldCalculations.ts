import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { IlkData } from '../../blockchain/ilks'
import { one } from '../../helpers/zero'
import { HistoricalTokenPricesApiResponse } from './makerOracleTokenPrices'

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
  makerOracleTokenPrices$: (token: string) => Observable<HistoricalTokenPricesApiResponse>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
): Observable<Yield> {
  if (!SupportedIlkForYieldsCalculations.includes(ilk)) {
    throw new Error(`${ilk} is not supported for Yields calculations`)
  }

  return ilkData$(ilk).pipe(
    switchMap(({ ilk, token, stabilityFee, liquidationRatio }) => {
      return combineLatest(
        makerOracleTokenPrices$(token),
        of({ ilk, stabilityFee, liquidationRatio }),
      )
    }),
    map(([prices, { ilk, stabilityFee, liquidationRatio }]) => {
      console.log('prices', prices)
      const result = [
        { period: YieldPeriod.Yield7Days, days: 7, price: prices.price7 },
        { period: YieldPeriod.Yield30Days, days: 30, price: prices.price30 },
        { period: YieldPeriod.Yield90Days, days: 90, price: prices.price90 },
      ]

      return result
        .map(({ period, days, price }) => {
          const multiple = one.div(liquidationRatio.minus(one))
          const value = calculateYield(
            new BigNumber(price),
            new BigNumber(prices.price),
            stabilityFee,
            days,
            multiple,
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

export function calculateYield(
  startPrice: BigNumber,
  endPrice: BigNumber,
  stabilityFee: BigNumber,
  days: number,
  multiple: BigNumber,
): BigNumber {
  const priceIncreasePercentage = endPrice.minus(startPrice).div(startPrice)
  const percentageYieldFromPriceIncreasePeriod = priceIncreasePercentage
    .times(multiple)
    .times(365 / days)

  const feeForYear = stabilityFee.times(multiple.minus(1))

  return percentageYieldFromPriceIncreasePeriod.minus(feeForYear)
}
