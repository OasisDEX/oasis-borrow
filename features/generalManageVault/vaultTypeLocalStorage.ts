import BigNumber from 'bignumber.js'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { VaultType } from './generalManageVault'

export function checkVaultTypeLocalStorage$(id: BigNumber): Observable<VaultType> {
  const vaultType = localStorage.getItem(`vault-type/${id.toFixed(0)}`) || VaultType.Borrow

  return of(vaultType).pipe(delay(500))
}

export type SaveVaultType = (id: BigNumber, token: string, vaultType: VaultType) => Observable<void>

export function saveVaultTypeLocalStorage$(
  id: BigNumber,
  token: string,
  vaultType: VaultType,
): Observable<void> {
  console.log('Do some validation with JWT Token', token)

  localStorage.setItem(`vault-type/${id.toFixed(0)}`, vaultType)

  return of(undefined).pipe(delay(2000))
}
