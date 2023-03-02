import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ProxiesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { PositionCreated } from 'features/aave/services/readPositionCreatedEvents'
import { PositionId } from 'features/aave/types'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators'

export interface DpmPositionData extends UserDpmAccount {
  collateralToken: string
  product: string
  protocol: string
  quoteToken: string
}

export function getDpmPositionData$(
  proxiesForPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  lastCreatedPositionForProxy$: (proxyAddress: string) => Observable<PositionCreated>,
  positionId: PositionId,
): Observable<DpmPositionData | null> {
  return proxiesForPosition$(positionId).pipe(
    switchMap(({ dpmProxy }) => {
      return combineLatest(
        of(dpmProxy),
        dpmProxy ? lastCreatedPositionForProxy$(dpmProxy.proxy) : of(undefined),
      )
    }),
    map(([dpmProxy, lastCreatedPosition]) => {
      return dpmProxy && lastCreatedPosition
        ? {
            ...dpmProxy,
            collateralToken: lastCreatedPosition.collateralTokenSymbol,
            product: lastCreatedPosition.positionType,
            protocol: lastCreatedPosition.protocol,
            quoteToken: lastCreatedPosition.debtTokenSymbol,
          }
        : null
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
