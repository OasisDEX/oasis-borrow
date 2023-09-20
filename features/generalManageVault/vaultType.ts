import type BigNumber from 'bignumber.js'
import { jwtAuthGetToken } from 'features/shared/jwt'
import type { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { catchError, delay, map, startWith } from 'rxjs/operators'

import type { SaveVaultType } from './vaultType.types'
import { VaultType } from './vaultType.types'

export function checkVaultTypeLocalStorage$(id: BigNumber): Observable<VaultType> {
  const vaultType = localStorage.getItem(`vault-type/${id.toFixed(0)}`) || VaultType.Borrow

  return of(vaultType).pipe(delay(500))
}

export function saveVaultTypeForAccount(
  saveVaultType$: SaveVaultType,
  account: string,
  vaultId: BigNumber,
  vaultType: VaultType,
  chainId: number,
  protocol: LendingProtocol,
  onSuccess: Function,
  onFailure: Function,
  onProgress: Function,
) {
  // assume that user went through ToS flow and can interact with application
  const token = jwtAuthGetToken(account)

  if (token) {
    saveVaultType$(vaultId, token, vaultType, chainId, protocol)
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
