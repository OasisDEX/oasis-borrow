import { BigNumber } from 'bignumber.js'
import { IStrategyInfo } from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import {
  AaveLikeReserveConfigurationData,
  AaveReserveConfigurationDataParams,
} from 'lendingProtocols/aave-like-common'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getStrategyInfo$(
  oracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: (
    args: AaveReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>,
  tokens: IStrategyConfig['tokens'],
): Observable<IStrategyInfo> {
  return combineLatest(
    oracleAssetPriceData$({ token: tokens.debt }),
    oracleAssetPriceData$({ token: tokens.collateral }),
    oracleAssetPriceData$({ token: tokens.deposit }),
    aaveReserveConfigurationData$({ collateralToken: tokens.collateral, debtToken: tokens.debt }),
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
