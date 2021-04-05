import { BigNumber } from 'bignumber.js'
import { OraclePriceData } from 'blockchain/prices'
import { nextHour, now } from 'helpers/time'
import { combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export interface PriceInfo {
  currentCollateralPrice: BigNumber
  currentEthPrice: BigNumber
  nextCollateralPrice?: BigNumber
  nextEthPrice?: BigNumber

  dateLastCollateralPrice?: Date
  dateNextCollateralPrice?: Date
  dateLastEthPrice?: Date
  dateNextEthPrice?: Date

  isStaticCollateralPrice: boolean
  isStaticEthPrice: boolean

  collateralPricePercentageChange?: BigNumber
  ethPricePercentageChange?: BigNumber
}

export function createPriceInfo$(
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  token: string,
): Observable<PriceInfo> {
  return combineLatest(oraclePriceData$(token), oraclePriceData$('ETH')).pipe(
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

export const protoETHPriceInfo: PriceInfo = {
  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('1780.7'),
  nextCollateralPrice: new BigNumber('1798.6'),
  isStaticCollateralPrice: false,
  collateralPricePercentageChange: new BigNumber('0.99004781496719670855'),
}

export const protoWBTCPriceInfo: PriceInfo = {
  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('56176.76'),
  isStaticCollateralPrice: false,
  nextCollateralPrice: new BigNumber('56762.258'),
  collateralPricePercentageChange: new BigNumber('0.98968508264769875786'),
}

export const protoUSDCPriceInfo: PriceInfo = {
  currentEthPrice: new BigNumber('1780.7'),
  nextEthPrice: new BigNumber('1798.6'),
  dateLastCollateralPrice: now,
  dateNextCollateralPrice: nextHour,
  dateLastEthPrice: now,
  dateNextEthPrice: nextHour,
  isStaticEthPrice: false,
  ethPricePercentageChange: new BigNumber('0.99004781496719670855'),

  currentCollateralPrice: new BigNumber('56176.76'),
  isStaticCollateralPrice: true,
}
