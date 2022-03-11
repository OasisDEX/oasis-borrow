import BigNumber from 'bignumber.js'
import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

const instiIlks = ['INST-ETH-A']

const cropJoinIlks = ['CRVSETHETH-A']

export enum MakerVaultType {
  CHARTER,
  CROP_JOIN,
  STANDARD,
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
  charterUrnProxy$: (usr: string) => Observable<string>,
  cdpRegistryOwns$: (cdpId: BigNumber) => Observable<string>,
  cdpManagerOwner$: (cdpId: BigNumber) => Observable<string>,
  proxyOwner$: (proxyAddress: string) => Observable<string>,
  cdpId: BigNumber,
): Observable<VaultResolve> {
  return cdpToIlk$(cdpId).pipe(
    switchMap((ilk) => {
      if (instiIlks.includes(ilk)) {
        return cdpRegistryOwns$(cdpId).pipe(
          switchMap((usr) =>
            combineLatest(
              // charterUrnProxy$(usr)
              of('0x04eE2920ea8D355c4e31C3267643aFDa2Abbde04'),
              proxyOwner$(usr),
            ).pipe(
              map(([urnAddress, controller]) => ({
                ilk,
                owner: usr,
                controller,
                urnAddress,
                type: MakerVaultType.CHARTER,
              })),
            ),
          ),
        )
      }
      if (cropJoinIlks.includes(ilk)) {
        throw new Error('cropJoinIlks not implemented')
      }

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
