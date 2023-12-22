import type BigNumber from 'bignumber.js'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export type CDPIdToTypeMapping = {
  [vaultId: string]: VaultType
}

export function createCheckOasisCDPType$(
  checkCdpTypeFromApi$: (data: {
    id: BigNumber
    protocol: string
    owner: string
  }) => Observable<VaultType>,
  mapCdpToIlk$: (cdpId: BigNumber) => Observable<string>,
  positionInfo: { id: BigNumber; protocol: LendingProtocol; owner: string },
): Observable<VaultType> {
  return combineLatest(checkCdpTypeFromApi$(positionInfo), mapCdpToIlk$(positionInfo.id)).pipe(
    map(([vaultTypeFromApi, ilk]) => {
      if (['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(ilk)) {
        return VaultType.Earn
      }
      return vaultTypeFromApi
    }),
  )
}
