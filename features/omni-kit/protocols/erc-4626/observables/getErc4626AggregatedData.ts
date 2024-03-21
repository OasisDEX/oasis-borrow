import type { DpmPositionData } from 'features/omni-kit/observables'
import type { Erc4626PositionAggregatedData } from 'features/omni-kit/protocols/erc-4626/helpers/getErc4626PositionAggregatedData'
import { getErc4626PositionAggregatedData } from 'features/omni-kit/protocols/erc-4626/helpers/getErc4626PositionAggregatedData'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { shareReplay } from 'rxjs/operators'

export const getErc4626PositionAggregatedData$ = ({
  dpmPositionData,
  networkId,
  vault,
}: {
  dpmPositionData: DpmPositionData
  networkId: OmniSupportedNetworkIds
  vault: string
}): Observable<Erc4626PositionAggregatedData> => {
  return from(getErc4626PositionAggregatedData(networkId, vault, dpmPositionData.proxy)).pipe(
    shareReplay(1),
  )
}
