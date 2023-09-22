import type { BigNumber } from 'bignumber.js'
import type { IStrategyInfo } from 'features/aave/types'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
} from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
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
