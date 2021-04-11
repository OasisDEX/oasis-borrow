import { BigNumber } from 'bignumber.js'
import { OraclePriceData } from 'blockchain/prices'
import { lastHour, nextHour, now } from 'helpers/time'
import { one } from 'helpers/zero'
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

export interface BuildPriceInfoProps {
  _oraclePriceData$?: Observable<OraclePriceData>
  collateralPrice?: BigNumber
  ethPrice?: BigNumber
  isStatic?: boolean
  collateralChangePercentage?: BigNumber // changes next price
  ethChangePercentage?: BigNumber
  token?: string
}

const defaultCollateralPrice = new BigNumber('550')
const defaultEthPrice = new BigNumber('1350')
const defaultIsStatic = false
const defaultCollateralChangePercentage = new BigNumber('0.05125')
const defaultEthChangePercentage = new BigNumber('0.0221')
const defaultToken = 'WBTC'

export function buildPriceInfo$({
  _oraclePriceData$,
  collateralPrice = defaultCollateralPrice,
  ethPrice = defaultEthPrice,
  isStatic = defaultIsStatic,
  collateralChangePercentage = defaultCollateralChangePercentage,
  ethChangePercentage = defaultEthChangePercentage,
  token = defaultToken,
}: BuildPriceInfoProps): Observable<PriceInfo> {
  const ethPriceInfo$ = of({
    currentPrice: ethPrice,
    isStaticPrice: false,
    nextPrice: ethPrice.times(one.plus(ethChangePercentage)),
    currentPriceUpdate: lastHour,
    nextPriceUpdate: nextHour,
    percentageChange: ethChangePercentage,
  })
  const collateralPriceInfo$ = of({
    currentPrice: collateralPrice,
    isStaticPrice: isStatic,
    ...(!isStatic && {
      nextPrice: collateralPrice.times(one.plus(collateralChangePercentage)),
      currentPriceUpdate: lastHour,
      nextPriceUpdate: nextHour,
      percentageChange: collateralChangePercentage,
    }),
  })

  const oraclePriceData$ = (_token: string) =>
    _oraclePriceData$ || _token === 'ETH' ? ethPriceInfo$ : collateralPriceInfo$
  return createPriceInfo$(oraclePriceData$, token)
}
