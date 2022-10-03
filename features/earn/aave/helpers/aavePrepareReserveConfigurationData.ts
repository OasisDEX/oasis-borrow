import { AaveReserveConfigurationData } from 'blockchain/calls/aaveProtocolDataProvider'
import { combineLatest, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

type PrepareAaveTVLProps = [AaveReserveConfigurationData]

export function aavePrepareReserveConfigurationData$(
  aaveReserveConfigurationData$: Observable<AaveReserveConfigurationData>,
): Observable<AaveReserveConfigurationData> {
  return combineLatest(aaveReserveConfigurationData$).pipe(
    switchMap(([aaveReserveConfigurationData]: PrepareAaveTVLProps) => {
      return of({
        ...aaveReserveConfigurationData,
      })
    }),
  )
}
