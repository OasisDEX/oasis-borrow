import BigNumber from 'bignumber.js'
import { GetEModeCategoryDataParameters, GetEModeCategoryDataResult } from 'blockchain/aave-v3'
import { ReserveConfigurationData } from 'lendingProtocols/aaveCommon'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export type GetReserveConfigurationDataWithEModeParameters = { token: string }

export function getReserveConfigurationDataWithEMode$(
  getReserveConfigurationData: ({
    token,
  }: {
    token: string
  }) => Observable<ReserveConfigurationData>,
  getAaveV3EModeCategoryForAsset: ({ token }: { token: string }) => Observable<BigNumber>,
  getEModeCategoryData: ({
    categoryId,
  }: GetEModeCategoryDataParameters) => Observable<GetEModeCategoryDataResult>,
  parameters: GetReserveConfigurationDataWithEModeParameters,
): Observable<ReserveConfigurationData> {
  return combineLatest(
    getAaveV3EModeCategoryForAsset(parameters),
    getReserveConfigurationData(parameters),
  ).pipe(
    switchMap(([categoryId, reserveData]) => {
      if (categoryId.isZero()) return of(reserveData)
      return getEModeCategoryData({ categoryId })
    }),
  )
}
