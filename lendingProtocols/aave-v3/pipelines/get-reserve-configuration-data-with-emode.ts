import type BigNumber from 'bignumber.js'
import type { GetEModeCategoryDataParameters, GetEModeCategoryDataResult } from 'blockchain/aave-v3'
import type { AaveLikeReserveConfigurationData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type GetReserveConfigurationDataWithEModeParameters = {
  collateralToken: string
  debtToken: string
}

export function getReserveConfigurationDataWithEMode$(
  getReserveConfigurationData: (args: {
    token: string
  }) => Observable<AaveLikeReserveConfigurationData>,
  getAaveV3EModeCategoryForAssets: (args: {
    debtToken: string
    collateralToken: string
  }) => Observable<BigNumber>,
  getEModeCategoryData: (
    params: Omit<GetEModeCategoryDataParameters, 'networkId'>,
  ) => Observable<GetEModeCategoryDataResult>,
  parameters: GetReserveConfigurationDataWithEModeParameters,
): Observable<AaveLikeReserveConfigurationData> {
  return combineLatest(
    getAaveV3EModeCategoryForAssets({
      debtToken: parameters.debtToken,
      collateralToken: parameters.collateralToken,
    }),
    getReserveConfigurationData({ token: parameters.collateralToken }),
  ).pipe(
    switchMap(([strategyCategory, reserveData]) => {
      if (strategyCategory.isZero()) return of(reserveData)

      return getEModeCategoryData({
        categoryId: strategyCategory,
      })
    }),
  )
}
