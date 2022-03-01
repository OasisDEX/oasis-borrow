import BigNumber from 'bignumber.js'
import {  Observable, of } from 'rxjs'
import {  tap } from 'rxjs/operators'

import { VaultType } from '../generalManageVault/vaultType'

export type VaultIdToTypeMapping = {
  [vaultId: string]: VaultType
}

export function createCheckVaultType$(
  checkVaultFromApi: (id: BigNumber) => Observable<VaultType>,
  hardcodedVaultIds: VaultIdToTypeMapping,
  vaultId: BigNumber,
): Observable<VaultType> {
  let obs: Observable<VaultType>
  if (hardcodedVaultIds[vaultId.toString()]) {
    obs = of(hardcodedVaultIds[vaultId.toNumber()])
  } else {
    obs = checkVaultFromApi(vaultId)
  }
  console.log(vaultId)
  return obs.pipe(tap((v) => console.log(v)))
}
