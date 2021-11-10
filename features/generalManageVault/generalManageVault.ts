import BigNumber from 'bignumber.js'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ManageMultiplyVaultState } from '../manageMultiplyVault/manageMultiplyVault'
import { ManageVaultState } from '../manageVault/manageVault'

export enum VaultType {
  Borrow = 'borrow',
  Multiply = 'multiply',
}

type WithToggle<T> = T & { toggleVaultType: () => void }

export type GeneralManageVaultState =
  | {
      type: VaultType.Borrow
      state: WithToggle<ManageVaultState>
    }
  | {
      type: VaultType.Multiply
      state: WithToggle<ManageMultiplyVaultState>
    }

export function createGeneralManageVault$(
  manageMultiplyVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  manageVault$: (id: BigNumber) => Observable<ManageVaultState>,
  checkVaultType$: (id: BigNumber) => Observable<VaultType>,
  id: BigNumber
): Observable<GeneralManageVaultState> {
  return checkVaultType$(id).pipe(
    switchMap((type) => {
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
        default:
          throw new UnreachableCaseError(type)
      }
    }),
  )
}
