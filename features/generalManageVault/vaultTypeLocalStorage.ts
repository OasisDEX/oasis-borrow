import BigNumber from 'bignumber.js'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'

import { VaultType } from './generalManageVault'

export function checkVaultTypeLocalStorage$(id: BigNumber): Observable<VaultType> {
  const vaultType = localStorage.getItem(`vault-type/${id.toFixed(0)}`) || VaultType.Borrow

  return of(vaultType).pipe(delay(500))
}

// TODO ŁW: Refactor move this type to separate file? It's not related to localStorage
export type SaveVaultType = (
  id: BigNumber,
  token: string,
  vaultType: VaultType,
  chainId: number,
) => Observable<void>

/**
 * @deprecated The method should not be used unless for some reason there will be requirement
 * to duplicate data in localStorage of user's browser or for some experimental/dev reasoon
 */
export function saveVaultTypeLocalStorage$(
  id: BigNumber,
  token: string,
  vaultType: VaultType,
): Observable<void> {
  localStorage.setItem(`vault-type/${id.toFixed(0)}`, vaultType)

  return of(undefined).pipe(delay(2000))
}
