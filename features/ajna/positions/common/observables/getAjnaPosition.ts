import { AjnaEarnPosition, AjnaPosition, views } from '@oasisdex/oasis-actions-poc'
import { Context } from 'blockchain/network'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

export function getAjnaPosition$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  { collateralToken, product, protocol, proxy, quoteToken }: DpmPositionData,
): Observable<AjnaPosition | AjnaEarnPosition> {
  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(async ([context]) => {
      if (protocol !== 'Ajna') return null

      const commonPayload = {
        proxyAddress: proxy,
        poolAddress:
          context.ajnaPoolPairs[
            `${collateralToken}-${quoteToken}` as keyof typeof context.ajnaPoolPairs
          ].address,
      }

      const commonDependency = {
        poolInfoAddress: context.ajnaPoolInfo.address,
        provider: context.rpcProvider,
      }

      return product === 'earn'
        ? await views.ajna.getEarnPosition(commonPayload, {
            ...commonDependency,
            getEarnData: getAjnaEarnData,
          })
        : await views.ajna.getPosition(commonPayload, commonDependency)
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
