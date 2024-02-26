import type { NetworkIds } from 'blockchain/networks'
import { getUserDpmProxy } from 'blockchain/userDpmProxies'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { PositionId } from 'features/aave/types'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { from, iif } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export interface AddressesRelatedWithPosition {
  dsProxy: string | undefined
  dpmProxy: UserDpmAccount | undefined
  walletAddress: string
}

export function getProxiesRelatedWithPosition$(
  proxyAddress$: (address: string) => Observable<string | undefined>,
  positionId: PositionId,
  networkId: NetworkIds,
): Observable<AddressesRelatedWithPosition> {
  return iif(
    () => positionId.vaultId !== undefined,
    from(getUserDpmProxy(positionId.vaultId!, networkId)).pipe(
      map((dpmProxy) => ({ dpmProxy: dpmProxy, dsProxy: undefined })),
    ),
    proxyAddress$(positionId.walletAddress!).pipe(
      map((proxyAddress) => ({
        dsProxy: proxyAddress,
        dpmProxy: undefined,
      })),
    ),
  ).pipe(
    map(({ dsProxy, dpmProxy }) => {
      return {
        dsProxy,
        dpmProxy,
        walletAddress: (dpmProxy?.user || positionId.walletAddress)!,
      }
    }),
    distinctUntilChanged(isEqual),
  )
}
