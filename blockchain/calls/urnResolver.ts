import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

const instiIlks = ['INST-ETH-A']

const cropJoinIlks = ['CRVSETHETH-A']

export function createUrnResolver$(
  cdpToIlk$: (cdpId: BigNumber) => Observable<string>,
  cdpManagerUrns$: (cdpId: BigNumber) => Observable<string>,
  charterUrnProxy$: (usr: string) => Observable<string>,
  cdpRegistryOwns$: (cdpId: BigNumber) => Observable<string>,
  cdpId: BigNumber,
): Observable<string> {
  return cdpToIlk$(cdpId).pipe(
    switchMap((ilk) => {
      if (instiIlks.includes(ilk)) {
        return cdpRegistryOwns$(cdpId).pipe(switchMap((usr) => charterUrnProxy$(usr)))
      }
      if (cropJoinIlks.includes(ilk)) {
        throw new Error('cropJoinIlks not implemented')
      }

      return cdpManagerUrns$(cdpId)
    }),
  )
}
