import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { ManageEarnVaultState } from 'features/earn/guni/manage/pipes/manageGuniVault'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { LendingProtocol } from 'lendingProtocols'
import { Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import { VaultType } from './vaultType'

export type WithToggle<T> = T & { toggleVaultType: () => void }

export type GeneralManageVaultState =
  | {
      type: VaultType.Insti
      state: WithToggle<ManageInstiVaultState>
    }
  | {
      type: VaultType.Borrow
      state: WithToggle<ManageStandardBorrowVaultState>
    }
  | {
      type: VaultType.Multiply
      state: WithToggle<ManageMultiplyVaultState>
    }
  | {
      type: VaultType.Earn
      state: WithToggle<ManageEarnVaultState>
    }

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
