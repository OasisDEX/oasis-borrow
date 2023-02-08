import { views } from '@oasisdex/oasis-actions'
import { Context } from 'blockchain/network'
import { PositionId } from 'features/aave/types'
import { DpmPositionData } from 'features/ajna/common/observables/getDpmPositionData'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/src/helpers/ajna'

export interface AjnaPositionWithMeta {
  position: AjnaPosition
  meta: DpmPositionData
}

export function getAjnaPosition$(
  context$: Observable<Context>,
  dpmPositionData$: (positionId: PositionId) => Observable<DpmPositionData | null>,
  positionId: PositionId,
): Observable<AjnaPositionWithMeta | null> {
  return combineLatest(context$, dpmPositionData$(positionId)).pipe(
    switchMap(async ([context, dpmPositionData]) => {
      return dpmPositionData
        ? {
            position: await views.ajna.getPosition(
              {
                proxyAddress: dpmPositionData.proxy,
                poolAddress:
                  context.ajnaPoolPairs[
                    `${dpmPositionData.collateralToken}-${dpmPositionData.quoteToken}` as keyof typeof context.ajnaPoolPairs
                  ].address,
              },
              {
                poolInfoAddress: context.ajnaPoolInfo.address,
                provider: context.rpcProvider,
              },
            ),
            meta: dpmPositionData,
          }
        : null
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
