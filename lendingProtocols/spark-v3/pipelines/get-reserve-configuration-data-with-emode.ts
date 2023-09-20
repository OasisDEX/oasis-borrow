import type BigNumber from 'bignumber.js'
import type {
  GetEModeCategoryDataParameters,
  GetEModeCategoryDataResult,
} from 'blockchain/spark-v3'
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
  getSparkV3EModeCategoryForAsset: (args: { token: string }) => Observable<BigNumber>,
  getEModeCategoryData: (
    params: Omit<GetEModeCategoryDataParameters, 'networkId'>,
  ) => Observable<GetEModeCategoryDataResult>,
  parameters: GetReserveConfigurationDataWithEModeParameters,
): Observable<AaveLikeReserveConfigurationData> {
  return combineLatest(
    getSparkV3EModeCategoryForAsset({ token: parameters.collateralToken }),
    getSparkV3EModeCategoryForAsset({ token: parameters.debtToken }),
    getReserveConfigurationData({ token: parameters.collateralToken }),
  ).pipe(
    switchMap(([collateralCategory, debtCategory, reserveData]) => {
      if (collateralCategory.isZero()) return of(reserveData)
      if (!collateralCategory.eq(debtCategory)) return of(reserveData)

      return getEModeCategoryData({ categoryId: collateralCategory })
    }),
  )
}
