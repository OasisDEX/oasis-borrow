import BigNumber from 'bignumber.js'
import { MakerOracleTokenPrice } from 'features/earn/makerOracleTokenPrices'
import { isEqual } from 'lodash'
import moment from 'moment'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { IlkData } from '../../blockchain/ilks'
import { one, zero } from '../zero'

export enum YieldPeriod {
  Yield7Days,
  Yield30Days,
  Yield90Days,
}

export interface YieldValue {
  days: number
  value: BigNumber
}

export interface Yield {
  ilk: string
  yields: {
    [key in YieldPeriod]?: YieldValue
  }
}

export interface YieldChange {
  yieldValue: BigNumber
  change: BigNumber
  days: number
}

export interface YieldChanges {
  ilk: string
  currentDate: moment.Moment
  previousDate: moment.Moment
  changes: {
    [key in YieldPeriod]?: YieldChange
  }
}

export const SupportedIlkForYieldsCalculations = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A']

export function getYields$(
  makerOracleTokenPricesInDates$: (
    token: string,
    timestamps: moment.Moment[],
  ) => Observable<MakerOracleTokenPrice[]>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  ilk: string,
  date?: moment.Moment,
): Observable<Yield> {
  if (!SupportedIlkForYieldsCalculations.includes(ilk)) {
    throw new Error(`${ilk} is not supported for Yields calculations`)
  }

  const referenceDate = date || moment()

  const timestampsWithPeriods = [
    {
      period: YieldPeriod.Yield7Days,
      date: referenceDate.clone().subtract(7, 'day'),
      days: 7,
    },
    {
      period: YieldPeriod.Yield30Days,
      date: referenceDate.clone().subtract(30, 'day'),
      days: 30,
    },
    {
      period: YieldPeriod.Yield90Days,
      date: referenceDate.clone().subtract(90, 'day'),
      days: 90,
    },
  ]

  const timestamps = [referenceDate, ...timestampsWithPeriods.map((t) => t.date)]

  return ilkData$(ilk).pipe(
    switchMap(({ ilk, token, stabilityFee, liquidationRatio }) => {
      return combineLatest(
        makerOracleTokenPricesInDates$(token, timestamps),
        of({ ilk, stabilityFee, liquidationRatio }),
      )
    }),
    map(([prices, { ilk, stabilityFee, liquidationRatio }]) => {
      const currentPrice = prices.find((price) =>
        price.requestedTimestamp.isSame(referenceDate, 'day'),
      )!.price
      const result = timestampsWithPeriods.map((timestampWithPeriod) => {
        const price = prices.find((price) =>
          price.requestedTimestamp.isSame(timestampWithPeriod.date, 'day'),
        )
        return {
          ...timestampWithPeriod,
          price: price!.price,
        }
      })

      return result
        .map(({ period, days, price }) => {
          const multiple = one.div(liquidationRatio.minus(one))
          const value = calculateYield(
            new BigNumber(price),
            new BigNumber(currentPrice),
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

function calculateChange(current?: YieldValue, previous?: YieldValue): YieldChange {
  if (!current || !previous) {
    return { yieldValue: zero, change: zero, days: 0 }
  }
  const yieldValue = current.value
  const change = yieldValue.minus(previous.value)
  const days = current.days
  return { change, yieldValue, days }
}

export function getYieldChange$(
  getYields$: (ilk: string, referenceDate: moment.Moment) => Observable<Yield>,
  currentDate: moment.Moment,
  previousDate: moment.Moment,
  ilk: string,
): Observable<YieldChanges> {
  if (!SupportedIlkForYieldsCalculations.includes(ilk)) {
    throw new Error(`${ilk} is not supported for Yields calculations`)
  }

  return combineLatest(getYields$(ilk, currentDate), getYields$(ilk, previousDate)).pipe(
    map(([currentYields, previousYields]) => {
      const changes = {
        [YieldPeriod.Yield7Days]: calculateChange(
          currentYields.yields[YieldPeriod.Yield7Days],
          previousYields.yields[YieldPeriod.Yield7Days],
        ),
        [YieldPeriod.Yield30Days]: calculateChange(
          currentYields.yields[YieldPeriod.Yield30Days],
          previousYields.yields[YieldPeriod.Yield30Days],
        ),
        [YieldPeriod.Yield90Days]: calculateChange(
          currentYields.yields[YieldPeriod.Yield90Days],
          previousYields.yields[YieldPeriod.Yield90Days],
        ),
      }
      return {
        ilk,
        currentDate,
        previousDate,
        changes,
      }
    }),
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

interface CalculateEarnings {
  depositAmount: BigNumber
  apy: BigNumber
  days: BigNumber
}

export function calculateEarnings({ depositAmount, apy, days }: CalculateEarnings) {
  const earningsAfterFees = depositAmount.times(apy.div(365).times(days).plus(one))

  return {
    earningsAfterFees: earningsAfterFees.minus(depositAmount),
    netValue: earningsAfterFees,
  }
}

interface CalculateBreakeven {
  depositAmount: BigNumber
  entryFees: BigNumber
  apy: BigNumber
}

export function calculateBreakeven({ depositAmount, entryFees, apy }: CalculateBreakeven) {
  const earningsPerDay = depositAmount.times(apy.plus(one)).minus(depositAmount).div(365)
  return entryFees.div(earningsPerDay)
}
