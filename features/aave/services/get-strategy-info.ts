import { BigNumber } from 'bignumber.js'
import { IStrategyInfo } from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
} from 'lendingProtocols/aave-like-common'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getStrategyInfo$(
  oracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveLikeReserveConfigurationData$: (
    args: AaveLikeReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>,
  tokens: IStrategyConfig['tokens'],
): Observable<IStrategyInfo> {
  return combineLatest(
    oracleAssetPriceData$({ token: tokens.debt }),
    oracleAssetPriceData$({ token: tokens.collateral }),
    oracleAssetPriceData$({ token: tokens.deposit }),
    aaveLikeReserveConfigurationData$({
      collateralToken: tokens.collateral,
      debtToken: tokens.debt,
    }),
  ).pipe(
    map(([debtPrice, collateralPrice, depositPrice, reserveConfigurationData]) => ({
      oracleAssetPrice: {
        debt: debtPrice,
        collateral: collateralPrice,
        deposit: depositPrice,
      },
      liquidationBonus: reserveConfigurationData.liquidationBonus,
      tokens,
    })),
  )
}
