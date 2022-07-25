import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { VaultType } from '../generalManageVault/vaultType'

export type CDPIdToTypeMapping = {
  [vaultId: string]: VaultType
}

export function createCheckOasisCDPType$(
  checkCdpTypeFromApi$: (id: BigNumber) => Observable<VaultType>,
  mapCdpToIlk$: (cdpId: BigNumber) => Observable<string>,
  charterIlks: string[],
  cdpId: BigNumber,
): Observable<VaultType> {
  return combineLatest(checkCdpTypeFromApi$(cdpId), mapCdpToIlk$(cdpId)).pipe(
    map(([vaultTypeFromApi, ilk]) => {
      if (charterIlks.includes(ilk)) {
        return VaultType.Insti
      }
      if (['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(ilk)) {
        return VaultType.Earn
      }
      return vaultTypeFromApi
    }),
  )
}
