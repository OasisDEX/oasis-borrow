import BigNumber from 'bignumber.js'
import { jwtAuthGetToken } from 'features/termsOfService/jwt'
import { Observable, of } from 'rxjs'
import { catchError, delay, map, startWith } from 'rxjs/operators'

export function checkVaultTypeLocalStorage$(id: BigNumber): Observable<VaultType> {
  const vaultType = localStorage.getItem(`vault-type/${id.toFixed(0)}`) || VaultType.Borrow

  return of(vaultType).pipe(delay(500))
}

export enum VaultType {
  Insti = 'insti',
  Borrow = 'borrow',
  Multiply = 'multiply',
  Earn = 'earn',
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
