import type BigNumber from 'bignumber.js'
import type { LendingProtocol } from 'lendingProtocols'
import { of } from 'rxjs'
import { catchError, map, startWith } from 'rxjs/operators'

import type { SaveVaultType, VaultType } from './vaultType.types'

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
  saveVaultType$(vaultId, vaultType, chainId, protocol, account)
    .pipe<Function>(
      map(() => onSuccess),
      catchError(() => of(onFailure)),
      startWith(onProgress),
    )
    .subscribe((func) => func())
}
