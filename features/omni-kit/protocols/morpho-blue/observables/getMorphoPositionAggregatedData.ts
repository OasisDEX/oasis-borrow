import type { DpmPositionData } from 'features/omni-kit/observables'
import { type AjnaUnifiedHistoryEvent } from 'features/omni-kit/protocols/ajna/history'
import { getMorpoPositionAggregatedData } from 'features/omni-kit/protocols/morpho-blue/helpers'
import { mapMorphoLendingEvents } from 'features/omni-kit/protocols/morpho-blue/history'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export type MorphoPositionAuction = {}

export interface MorphoPositionAggregatedDataResponse {
  auction: MorphoPositionAuction
  history: AjnaUnifiedHistoryEvent[]
}

function parseAggregatedDataHistory({
  history,
}: {
  history: AjnaUnifiedHistoryEvent[]
}): AjnaUnifiedHistoryEvent[] {
  return mapMorphoLendingEvents(history) as AjnaUnifiedHistoryEvent[]
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
