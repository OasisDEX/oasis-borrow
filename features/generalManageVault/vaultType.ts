import BigNumber from 'bignumber.js'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { Observable, of } from 'rxjs'
import { catchError, delay, map, startWith } from 'rxjs/operators'

export function checkVaultTypeLocalStorage$(id: BigNumber): Observable<VaultType> {
  const vaultType = localStorage.getItem(`vault-type/${id.toFixed(0)}`) || VaultType.Borrow

  return of(vaultType).pipe(delay(500))
}

export enum VaultType {
  Borrow = 'borrow',
  Multiply = 'multiply',
}

export type SaveVaultType = (
  id: BigNumber,
  token: string,
  vaultType: VaultType,
  chainId: number,
) => Observable<void>

export function saveVaultTypeForAccount(
  saveVaultType$: SaveVaultType,
  account: string,
  vaultId: BigNumber,
  vaultType: VaultType,
  chainId: number,
  onSuccess: Function,
  onFailure: Function,
  onProgress: Function,
) {
  // assume that user went through ToS flow and can interact with application
  const token = jwtAuthGetToken(account)

  if (token) {
    saveVaultType$(vaultId, token, vaultType, chainId)
      .pipe<Function>(
        map(() => onSuccess),
        catchError(() => of(onFailure)),
        startWith(onProgress),
      )
      .subscribe((func) => func())
  } else {
    onFailure()
  }
}

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

export function isInstiVault(vaultID: BigNumber) {
  const INSTI_VAULT_IDS: BigNumber[] = [] // add your vault id here for testing
  return INSTI_VAULT_IDS.some((bn) => bn.eq(vaultID))
}
