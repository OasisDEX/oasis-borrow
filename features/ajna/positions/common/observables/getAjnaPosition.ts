import { views } from '@oasisdex/oasis-actions'
import { Context } from 'blockchain/network'
import { ethers } from 'ethers'
import { PositionId } from 'features/aave/types'
import { AjnaProduct } from 'features/ajna/common/types'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { isEqual } from 'lodash'
import { combineLatest, Observable, of } from 'rxjs'
import { distinctUntilChanged, shareReplay, switchMap } from 'rxjs/operators'

import { AjnaPosition } from '@oasis-actions-poc/lib/packages/oasis-actions/src/helpers/ajna'

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
  onEveryBlock$: Observable<number>,
  { collateralToken, positionId, product, quoteToken }: GetAjnaPositionIdentification,
): Observable<AjnaPositionWithMeta | null> {
  return combineLatest(
    context$,
    positionId ? dpmPositionData$(positionId) : of(undefined),
    onEveryBlock$,
  ).pipe(
    switchMap(async ([context, dpmPositionData]) => {
      if (dpmPositionData && dpmPositionData.protocol !== 'Ajna') return null

      const meta = positionId
        ? (dpmPositionData as DpmPositionData)
        : {
            collateralToken,
            product,
            protocol: 'Ajna',
            proxy: ethers.constants.AddressZero,
            quoteToken,
            user: ethers.constants.AddressZero,
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
          product: (meta.product as string).toLowerCase() as AjnaProduct,
        },
      }
    }),
    distinctUntilChanged(isEqual),
    shareReplay(1),
  )
}
