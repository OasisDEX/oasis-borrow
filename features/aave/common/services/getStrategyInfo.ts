import { BigNumber } from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AaveV2ReserveConfigurationData } from '../../../../blockchain/aave'
import { IStrategyInfo } from '../BaseAaveContext'

export function getStrategyInfo$(
  aaveOracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<AaveV2ReserveConfigurationData>,
  collateralToken: string,
): Observable<IStrategyInfo> {
  return combineLatest(
    aaveOracleAssetPriceData$({ token: collateralToken }),
    aaveReserveConfigurationData$({ token: collateralToken }),
  ).pipe(
    map(([oracleAssetPrice, reserveConfigurationData]) => ({
      oracleAssetPrice,
      liquidationBonus: reserveConfigurationData.liquidationBonus,
      collateralToken: collateralToken,
    })),
  )
}
