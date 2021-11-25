import BigNumber from 'bignumber.js'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { Observable } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import { ManageMultiplyVaultState } from '../manageMultiplyVault/manageMultiplyVault'
import { ManageVaultState } from '../manageVault/manageVault'
import { Vault } from '../../blockchain/vaults'

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
  manageGuniVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  manageVault$: (id: BigNumber) => Observable<ManageVaultState>,
  checkVaultType$: (id: BigNumber) => Observable<VaultType>,
  vault$: (id: BigNumber) => Observable<Vault>,
  id: BigNumber,
): Observable<GeneralManageVaultState> {
  return checkVaultType$(id).pipe(
    switchMap((type) => {
      return vault$(id).pipe(
        filter(vault => vault !== undefined),
        switchMap((vault) => {
          switch (type) {
            case VaultType.Borrow:
              return manageVault$(id).pipe(
                map((state) => ({ ...state, toggleVaultType: () => {} })),
                map((state) => ({ state, type })),
              )
            case VaultType.Multiply:
              if (vault.token === 'GUNIV3DAIUSDC1') {
                return manageGuniVault$(id).pipe(
                  map((state) => ({ ...state, toggleVaultType: () => {} })),
                  map((state) => ({ state, type })),
                )
              }
              console.log('outside')
              console.log(vault)
              return manageMultiplyVault$(id).pipe(
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
