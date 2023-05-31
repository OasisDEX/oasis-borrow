import { NetworkNames } from 'blockchain/networks'
import { loadStrategyFromTokens } from 'features/aave'
import { IStrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { isEqual } from 'lodash'
import { Observable, of } from 'rxjs'
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators'

import { ProxiesRelatedWithPosition } from './getProxiesRelatedWithPosition'

export function getStrategyConfig$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  lastCreatedPositionForProxy$: (proxyAddress: string) => Observable<PositionCreated>,
  positionId: PositionId,
  networkName: NetworkNames,
): Observable<IStrategyConfig | undefined> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dsProxy, dpmProxy }) => {
      const effectiveProxyAddress = dsProxy || dpmProxy?.proxy
      if (effectiveProxyAddress === undefined) {
        return of(undefined)
      } else {
        return lastCreatedPositionForProxy$(effectiveProxyAddress)
      }
    }),
    map((lastCreatedPosition) => {
      if (lastCreatedPosition !== undefined) {
        return loadStrategyFromTokens(
          lastCreatedPosition.collateralTokenSymbol,
          lastCreatedPosition.debtTokenSymbol,
          networkName,
        )
      }
      return undefined
    }),
    distinctUntilChanged(isEqual),
  )
}
