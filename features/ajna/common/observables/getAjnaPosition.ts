import { views } from '@oasisdex/oasis-actions'
import { Context } from 'blockchain/network'
import { PositionId } from 'features/aave/types'
import { DpmPositionData } from 'features/ajna/common/observables/getDpmPositionData'
import { AjnaProduct } from 'features/ajna/common/types'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/src/helpers/ajna'

interface AjnaMeta extends Omit<DpmPositionData, 'product'> {
  product: AjnaProduct
}
interface GetAjnaPositionIdentificationWithPosition {
  positionId: PositionId
  collateralToken?: never
  product?: never
  quoteToken?: never
}
interface GetAjnaPositionIdentificationWithoutPosition {
  collateralToken: string
  product: string
  quoteToken: string
  positionId?: never
}
export type GetAjnaPositionIdentification =
  | GetAjnaPositionIdentificationWithPosition
  | GetAjnaPositionIdentificationWithoutPosition

interface AjnaPositionWithMeta {
  position: AjnaPosition
  meta: AjnaMeta
}

export function getAjnaPosition$(
  context$: Observable<Context>,
  dpmPositionData$: (positionId: PositionId) => Observable<DpmPositionData | null>,
  { collateralToken, positionId, product, quoteToken }: GetAjnaPositionIdentification,
): Observable<AjnaPositionWithMeta | null> {
  return combineLatest(context$, positionId ? dpmPositionData$(positionId) : of(undefined)).pipe(
    switchMap(async ([context, dpmPositionData]) => {
      if (dpmPositionData && dpmPositionData.protocol !== 'Ajna') return null

      const meta: DpmPositionData = positionId
        ? (dpmPositionData as DpmPositionData)
        : {
            collateralToken: collateralToken,
            product: product,
            protocol: 'Ajna',
            proxy: '0x0000000000000000000000000000000000000000',
            quoteToken: quoteToken,
            user: '0x0000000000000000000000000000000000000000',
            vaultId: '0',
          }

      return {
        position: await views.ajna.getPosition(
          {
            proxyAddress: meta.proxy,
            poolAddress:
              context.ajnaPoolPairs[
                `${meta.collateralToken}-${meta.quoteToken}` as keyof typeof context.ajnaPoolPairs
              ].address,
          },
          {
            poolInfoAddress: context.ajnaPoolInfo.address,
            provider: context.rpcProvider,
          },
        ),
        meta: {
          ...meta,
          product: meta.product.toLowerCase() as AjnaProduct,
        },
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
