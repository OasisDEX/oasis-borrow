import { isEqual } from 'lodash'
import { iif, Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { UserDpmProxy } from '../../../blockchain/userDpmProxies'
import { PositionId } from '../types'

export interface ProxiesRelatedWithPosition {
  dsProxy: string | undefined
  dpmProxy: UserDpmProxy | undefined
  walletAddress: string
}

export function getProxiesRelatedWithPosition$(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  dpmProxy$: (vaultId: number) => Observable<UserDpmProxy | undefined>,
  positionId: PositionId,
): Observable<ProxiesRelatedWithPosition> {
  return iif(
    () => positionId.vaultId !== undefined,
    dpmProxy$(positionId.vaultId!).pipe(
      map((dpmProxy) => ({ dpmProxy: dpmProxy, dsProxy: undefined })),
    ),
    proxyAddress$(positionId.walletAddress!).pipe(
      map((proxyAddress) => ({
        dsProxy: proxyAddress,
        dpmProxy: undefined,
      })),
    ),
  ).pipe(
    map(({ dsProxy, dpmProxy }) => ({
      dsProxy,
      dpmProxy,
      walletAddress: (dpmProxy?.user || positionId.walletAddress)!,
    })),
    distinctUntilChanged(isEqual),
  )
}
