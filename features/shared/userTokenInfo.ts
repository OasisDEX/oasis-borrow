import { BigNumber } from 'bignumber.js'
import { OraclePriceData } from 'blockchain/prices'
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
