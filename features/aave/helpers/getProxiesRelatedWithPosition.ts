import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { PositionId } from 'features/aave/types'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { iif } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export interface ProxiesRelatedWithPosition {
  dsProxy: string | undefined
  dpmProxy: UserDpmAccount | undefined
  walletAddress: string
}

export function getProxiesRelatedWithPosition$(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  dpmProxy$: (vaultId: number) => Observable<UserDpmAccount | undefined>,
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
