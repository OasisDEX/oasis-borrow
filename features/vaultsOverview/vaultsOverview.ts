import { AjnaPositionDetails } from 'features/ajna/positions/common/observables/getAjnaPosition'
import { Dsr } from 'features/dsr/utils/createDsr'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { AaveLikePosition } from './pipes/positions'
import { MakerPositionDetails } from './pipes/positionsList'

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
