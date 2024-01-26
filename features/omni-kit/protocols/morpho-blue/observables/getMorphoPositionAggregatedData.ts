import type { DpmPositionData } from 'features/omni-kit/observables'
import { getMorpoPositionAggregatedData } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { mapMorphoLendingEvents } from 'features/omni-kit/protocols/morpho-blue/history'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export type MorphoPositionAuction = {}

export interface MorphoPositionAggregatedDataResponse {
  auction: MorphoPositionAuction
  history: MorphoHistoryEvent[]
}

function parseAggregatedDataHistory({
  history,
}: {
  history: MorphoHistoryEvent[]
}): MorphoHistoryEvent[] {
  return mapMorphoLendingEvents(history) as MorphoHistoryEvent[]
}

export const getMorphoPositionAggregatedData$ = ({
  dpmPositionData,
  networkId,
}: {
  dpmPositionData: DpmPositionData
  networkId: OmniSupportedNetworkIds
}): Observable<MorphoPositionAggregatedDataResponse> => {
  const { proxy } = dpmPositionData

  return from(
    getMorpoPositionAggregatedData(
      proxy,
      networkId,
      dpmPositionData.collateralTokenAddress,
      dpmPositionData.quoteTokenAddress,
    ),
  ).pipe(
    map(({ auctions: _auctions, history }) => ({
      auction: {},
      history: parseAggregatedDataHistory({ history }),
    })),
    shareReplay(1),
  )
}
