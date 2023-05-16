import { calculateAjnaApyPerDays } from '@oasisdex/dma-library'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import { AjnaPoolData } from 'features/ajna/common/types'
import { getAjnaPoolsTableData } from 'features/ajna/positions/common/helpers/getAjnaPoolsTableData'
import { one } from 'helpers/zero'
import { from, Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export function getAjnaPoolsTableContent$(
  context$: Observable<Context>,
  tokenPriceUSDStatic$: (tokens: string[]) => Observable<Tickers>,
): Observable<AjnaPoolData> {
  return context$.pipe(
    switchMap((context) => {
      return from(getAjnaPoolsTableData()).pipe(
        switchMap((data) => {
          const tokens = [
            ...new Set(
              data.flatMap((pool) => {
                try {
                  return [
                    getTokenSymbolFromAddress(context, pool.quoteTokenAddress),
                    getTokenSymbolFromAddress(context, pool.collateralAddress),
                  ]
                } catch (e) {
                  console.warn('Token address not found within context', e)
                  return []
                }
              }),
            ),
          ]

          return tokenPriceUSDStatic$(tokens).pipe(
            map((prices) => {
              return data.reduce((acc, curr) => {
                const {
                  collateralAddress,
                  quoteTokenAddress,
                  interestRate,
                  debt,
                  depositSize,
                  dailyPercentageRate30dAverage,
                  poolMinDebtAmount,
                  lowestUtilizedPrice,
                  highestThresholdPrice,
                } = curr

                try {
                  const collateralToken = getTokenSymbolFromAddress(context, collateralAddress)
                  const quoteToken = getTokenSymbolFromAddress(context, quoteTokenAddress)

                  const collateralPrice = prices[collateralToken]
                  const quotePrice = prices[quoteToken]
                  const marketPrice = collateralPrice.div(quotePrice)
                  const maxLtv = lowestUtilizedPrice.div(marketPrice)
                  const maxMultiply = one.plus(one.div(one.div(maxLtv).minus(one)))

                  return {
                    ...acc,
                    [`${collateralToken}-${quoteToken}`]: {
                      '7DayNetApy': calculateAjnaApyPerDays(
                        depositSize,
                        dailyPercentageRate30dAverage,
                        7,
                      ),
                      '90DayNetApy': calculateAjnaApyPerDays(
                        depositSize,
                        dailyPercentageRate30dAverage,
                        90,
                      ),
                      annualFee: interestRate,
                      liquidityAvaliable: depositSize.minus(debt),
                      maxLtv,
                      minLtv: highestThresholdPrice.div(marketPrice),
                      maxMultiply,
                      minPositionSize: poolMinDebtAmount,
                      tvl: depositSize,
                      with50Tokens: maxMultiply.times(50),
                    },
                  }
                } catch (e) {
                  console.warn('Token address not found within context', e)
                  return acc
                }
              }, {} as AjnaPoolData)
            }),
            shareReplay(1),
          )
        }),
      )
    }),
  )
}
