import { BigNumber } from 'bignumber.js'
import { OraclePriceData } from 'blockchain/prices'
import { nextHour, now } from 'helpers/time'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

export interface UserTokenInfo {
  collateralBalance: BigNumber
  ethBalance: BigNumber
  daiBalance: BigNumber

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

export function createUserTokenInfo$(
  oraclePriceData$: (token: string) => Observable<OraclePriceData>,
  balance$: (token: string, address: string) => Observable<BigNumber>,
  token: string,
  account: string,
): Observable<UserTokenInfo> {
  return combineLatest(
    balance$(token, account),
    oraclePriceData$(token),
    balance$('ETH', account),
    oraclePriceData$('ETH'),
    balance$('DAI', account),
  ).pipe(
    switchMap(
      ([
        collateralBalance,
        {
          currentPrice: currentCollateralPrice,
          nextPrice: nextCollateralPrice,
          isStaticPrice: isStaticCollateralPrice,
          currentPriceUpdate: dateLastCollateralPrice,
          nextPriceUpdate: dateNextCollateralPrice,
          percentageChange: collateralPricePercentageChange,
        },
        ethBalance,
        {
          currentPrice: currentEthPrice,
          nextPrice: nextEthPrice,
          isStaticPrice: isStaticEthPrice,
          currentPriceUpdate: dateLastEthPrice,
          nextPriceUpdate: dateNextEthPrice,
          percentageChange: ethPricePercentageChange,
        },
        daiBalance,
      ]) =>
        of({
          collateralBalance,
          ethBalance,
          daiBalance,

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

export function createUserTokenInfoChange$<T extends keyof UserTokenInfo>(
  userTokenInfo$: (token: string, account: string) => Observable<UserTokenInfo>,
  token: string,
  account: string,
  kind: T,
) {
  return userTokenInfo$(token, account).pipe(
    map((userTokenInfo) => ({
      kind,
      [kind]: userTokenInfo[kind],
    })),
  )
}

export const protoUserETHTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

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

export const protoUserWBTCTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

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

export const protoUserUSDCTokenInfo: UserTokenInfo = {
  collateralBalance: zero,
  ethBalance: zero,
  daiBalance: zero,

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
