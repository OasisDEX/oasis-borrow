import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { Dsr } from 'features/dsr/utils/createDsr'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AavePosition } from './pipes/positions'
import { MakerPositionDetails } from './pipes/positionsList'

export interface PositionsList {
  makerPositions: MakerPositionDetails[]
  aavePositions: AavePosition[]
  ajnaPositions: AjnaPositionDetails[]
  dsrPosition: Dsr
}

export function createPositionsList$(
  makerPositions$: (address: string) => Observable<MakerPositionDetails[]>,
  aavePositions$: (address: string) => Observable<AavePosition[]>,
  ajnaPositions$: (address: string) => Observable<AjnaPositionDetails[]>,
  dsr$: (address: string) => Observable<Dsr>,
  address: string,
): Observable<PositionsList> {
  return combineLatest(
    makerPositions$(address),
    aavePositions$(address),
    ajnaPositions$(address),
    dsr$(address),
  ).pipe(
    map(([makerPositions, aavePositions, ajnaPositions, dsrPosition]) => ({
      makerPositions: makerPositions,
      aavePositions: aavePositions,
      ajnaPositions: ajnaPositions,
      dsrPosition: dsrPosition,
    })),
  )
}
