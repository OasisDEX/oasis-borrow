import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

export enum MakerVaultType {
  STANDARD = 'STANDARD',
}

export interface VaultResolve {
  ilk: string
  owner: string
  controller: string
  urnAddress: string
  type: MakerVaultType
}

export function createVaultResolver$(
  cdpToIlk$: (cdpId: BigNumber) => Observable<string>,
  cdpManagerUrns$: (cdpId: BigNumber) => Observable<string>,
  cdpManagerOwner$: (cdpId: BigNumber) => Observable<string>,
  proxyOwner$: (proxyAddress: string) => Observable<string>,
  cdpId: BigNumber,
): Observable<VaultResolve> {
  return cdpToIlk$(cdpId).pipe(
    switchMap((ilk) => {
      return combineLatest(cdpManagerOwner$(cdpId), cdpManagerUrns$(cdpId)).pipe(
        switchMap(([owner, urnAddress]) =>
          proxyOwner$(owner).pipe(
            map((controller) => ({
              ilk,
              owner,
              controller,
              urnAddress,
              type: MakerVaultType.STANDARD,
            })),
          ),
        ),
      )
    }),
  )
}
