import type BigNumber from 'bignumber.js'
import type { Vault } from 'blockchain/vaults.types'
import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { LendingProtocol } from 'lendingProtocols'
import type { Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import type { GeneralManageVaultState } from './generalManageVault.types'
import { VaultType } from './vaultType.types'

export function createGeneralManageVault$(
  manageInstiVault$: (id: BigNumber) => Observable<ManageInstiVaultState>,
  manageMultiplyVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  manageGuniVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  manageVault$: (id: BigNumber) => Observable<ManageStandardBorrowVaultState>,
  checkVaultType$: ({
    id,
    protocol,
  }: {
    id: BigNumber
    protocol: LendingProtocol
  }) => Observable<VaultType>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<GeneralManageVaultState> {
  return checkVaultType$({ id, protocol: LendingProtocol.Maker }).pipe(
    switchMap((type) => {
      return vault$(id).pipe(
        filter((vault) => vault !== undefined),
        switchMap(() => {
          switch (type) {
            case VaultType.Borrow:
              return manageVault$(id).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            case VaultType.Multiply:
              return manageMultiplyVault$(id).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            case VaultType.Earn:
              return manageGuniVault$(id).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            case VaultType.Insti:
              return manageInstiVault$(id).pipe(
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
