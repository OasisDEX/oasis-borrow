import { BigNumber } from 'bignumber.js'
import { IStrategyInfo } from 'features/aave/common/BaseAaveContext'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { ReserveConfigurationData } from 'lendingProtocols/aaveCommon'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function getStrategyInfo$(
  oracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<ReserveConfigurationData>,
  tokens: IStrategyConfig['tokens'],
): Observable<IStrategyInfo> {
  return combineLatest(
    oracleAssetPriceData$({ token: tokens.debt }),
    oracleAssetPriceData$({ token: tokens.collateral }),
    oracleAssetPriceData$({ token: tokens.deposit }),
    aaveReserveConfigurationData$({ token: tokens.collateral }),
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
