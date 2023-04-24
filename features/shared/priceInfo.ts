import { BigNumber } from 'bignumber.js'
import { OraclePriceData, OraclePriceDataArgs } from 'blockchain/prices'
import { combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export interface PriceInfo {
  currentCollateralPrice: BigNumber
  currentEthPrice: BigNumber
  nextCollateralPrice: BigNumber
  nextEthPrice: BigNumber

  dateLastCollateralPrice?: Date
  dateNextCollateralPrice?: Date
  dateLastEthPrice?: Date
  dateNextEthPrice?: Date

  isStaticCollateralPrice: boolean
  isStaticEthPrice: boolean

  collateralPricePercentageChange: BigNumber
  ethPricePercentageChange: BigNumber
}

export function createPriceInfo$(
  oraclePriceData$: (args: OraclePriceDataArgs) => Observable<OraclePriceData>,
  token: string,
): Observable<PriceInfo> {
  return combineLatest(
    oraclePriceData$({
      token,
      requestedData: [
        'currentPrice',
        'nextPrice',
        'isStaticPrice',
        'currentPriceUpdate',
        'nextPriceUpdate',
        'percentageChange',
      ],
    }),
    oraclePriceData$({
      token: 'ETH',
      requestedData: [
        'currentPrice',
        'nextPrice',
        'isStaticPrice',
        'currentPriceUpdate',
        'nextPriceUpdate',
        'percentageChange',
      ],
    }),
  ).pipe(
    switchMap(
      ([
        {
          currentPrice: currentCollateralPrice,
          nextPrice: nextCollateralPrice,
          isStaticPrice: isStaticCollateralPrice,
          currentPriceUpdate: dateLastCollateralPrice,
          nextPriceUpdate: dateNextCollateralPrice,
          percentageChange: collateralPricePercentageChange,
        },
        {
          currentPrice: currentEthPrice,
          nextPrice: nextEthPrice,
          isStaticPrice: isStaticEthPrice,
          currentPriceUpdate: dateLastEthPrice,
          nextPriceUpdate: dateNextEthPrice,
          percentageChange: ethPricePercentageChange,
        },
      ]) =>
        of({
          currentCollateralPrice,
          currentEthPrice,
          nextCollateralPrice,
          nextEthPrice,

          dateLastCollateralPrice,
          dateNextCollateralPrice,
          dateLastEthPrice,
          dateNextEthPrice,

          isStaticCollateralPrice,
          isStaticEthPrice,

          collateralPricePercentageChange,
          ethPricePercentageChange,
        }),
    ),
    shareReplay(1),
  )
}

export interface PriceInfoChange {
  kind: 'priceInfo'
  priceInfo: PriceInfo
}

export function priceInfoChange$(
  priceInfo$: (token: string) => Observable<PriceInfo>,
  token: string,
): Observable<PriceInfoChange> {
  return priceInfo$(token).pipe(
    map((priceInfo) => ({
      kind: 'priceInfo',
      priceInfo,
    })),
  )
}
