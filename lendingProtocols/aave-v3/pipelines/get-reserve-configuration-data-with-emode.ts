import BigNumber from 'bignumber.js'
import { GetEModeCategoryDataParameters, GetEModeCategoryDataResult } from 'blockchain/aave-v3'
import { ReserveConfigurationData } from 'lendingProtocols/aaveCommon'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type GetReserveConfigurationDataWithEModeParameters = {
  collateralToken: string
  debtToken: string
}

export function getReserveConfigurationDataWithEMode$(
  getReserveConfigurationData: (args: { token: string }) => Observable<ReserveConfigurationData>,
  getAaveV3EModeCategoryForAsset: (args: { token: string }) => Observable<BigNumber>,
  getEModeCategoryData: (
    params: Omit<GetEModeCategoryDataParameters, 'networkId'>,
  ) => Observable<GetEModeCategoryDataResult>,
  parameters: GetReserveConfigurationDataWithEModeParameters,
): Observable<ReserveConfigurationData> {
  return combineLatest(
    getAaveV3EModeCategoryForAsset({ token: parameters.collateralToken }),
    getAaveV3EModeCategoryForAsset({ token: parameters.debtToken }),
    getReserveConfigurationData({ token: parameters.collateralToken }),
  ).pipe(
    switchMap(([collateralCategory, debtCategory, reserveData]) => {
      if (collateralCategory.isZero()) return of(reserveData)
      if (!collateralCategory.eq(debtCategory)) return of(reserveData)

      return getEModeCategoryData({ categoryId: collateralCategory })
    }),
  )
}
