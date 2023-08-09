import { BigNumber } from 'bignumber.js'
import { IStrategyInfo } from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import {
  AaveReserveConfigurationDataParams,
  ReserveConfigurationData,
} from 'lendingProtocols/aaveCommon'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getStrategyInfo$(
  oracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: (
    args: AaveReserveConfigurationDataParams,
  ) => Observable<ReserveConfigurationData>,
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
