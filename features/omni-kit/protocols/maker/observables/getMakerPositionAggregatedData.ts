import type { DpmPositionData } from 'features/omni-kit/observables'
import { getMakerPositionAggregatedData } from 'features/omni-kit/protocols/maker/helpers'
import { mapMorphoLendingEvents } from 'features/omni-kit/protocols/morpho-blue/history'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export interface MorphoPositionAggregatedDataResponse {
  auction: MorphoHistoryEvent
  history: MorphoHistoryEvent[]
}

function parseAggregatedDataHistory({
  history,
}: {
  history: MorphoHistoryEvent[]
}): MorphoHistoryEvent[] {
  return mapMorphoLendingEvents(history) as MorphoHistoryEvent[]
}

export const getMakerPositionAggregatedData$ = ({
  dpmPositionData,
  networkId,
  poolId,
}: {
  dpmPositionData: DpmPositionData
  networkId: OmniSupportedNetworkIds
  poolId?: string
}): Observable<MorphoPositionAggregatedDataResponse> => {
  const { proxy } = dpmPositionData

  if (!poolId) {
    throw new Error('Maker market id not defined')
  }

  return from(
    getMakerPositionAggregatedData(
      proxy,
      networkId,
      dpmPositionData.collateralTokenAddress,
      dpmPositionData.quoteTokenAddress,
      poolId,
    ),
  ).pipe(
    map(({ auction, history }) => ({
      auction,
      history: parseAggregatedDataHistory({ history }),
    })),
    shareReplay(1),
  )
}
