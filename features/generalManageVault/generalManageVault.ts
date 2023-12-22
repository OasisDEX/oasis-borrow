import type BigNumber from 'bignumber.js'
import type { Vault } from 'blockchain/vaults.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import type { GeneralManageVaultState } from './generalManageVault.types'
import { VaultType } from './vaultType.types'

export function createGeneralManageVault$(
  manageMultiplyVault$: (
    id: BigNumber,
    vaultType: VaultType.Borrow | VaultType.Multiply,
  ) => Observable<ManageMultiplyVaultState>,
  manageGuniVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  checkVaultType$: ({
    id,
    protocol,
    owner,
  }: {
    id: BigNumber
    protocol: LendingProtocol
    owner: string
  }) => Observable<VaultType>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<GeneralManageVaultState> {
  return vault$(id).pipe(
    filter((vault) => vault !== undefined),
    switchMap((vault) => {
      return checkVaultType$({
        id,
        protocol: LendingProtocol.Maker,
        owner: vault.controller ?? vault.owner,
      }).pipe(
        switchMap((type) => {
          switch (type) {
            case VaultType.Borrow:
            case VaultType.Multiply:
              return manageMultiplyVault$(id, type).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            case VaultType.Earn:
              return manageGuniVault$(id).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            default:
              throw new UnreachableCaseError(type)
          }
        }),
      )
    }),
  )
}
