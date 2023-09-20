import type { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import type { Dsr } from 'features/dsr/utils/createDsr'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

import type { AaveLikePosition } from './pipes/positions'
import type { MakerPositionDetails } from './pipes/positionsList'

export interface PositionsList {
  makerPositions: MakerPositionDetails[]
  aaveLikePositions: AaveLikePosition[]
  ajnaPositions: AjnaPositionDetails[]
  dsrPosition: Dsr
}

export function createPositionsList$(
  makerPositions$: (address: string) => Observable<MakerPositionDetails[]>,
  aaveLikePositions$: (address: string) => Observable<AaveLikePosition[]>,
  ajnaPositions$: (address: string) => Observable<AjnaPositionDetails[]>,
  dsr$: (address: string) => Observable<Dsr>,
  address: string,
): Observable<PositionsList> {
  return combineLatest(
    makerPositions$(address),
    aaveLikePositions$(address),
    ajnaPositions$(address),
    dsr$(address),
  ).pipe(
    map(([makerPositions, aaveLikePositions, ajnaPositions, dsrPosition]) => ({
      makerPositions: makerPositions,
      aaveLikePositions: aaveLikePositions,
      ajnaPositions: ajnaPositions,
      dsrPosition: dsrPosition,
    })),
  )
}
