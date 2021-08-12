import {  Web3ContextConnected } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { jwtAuthGetToken, JWToken } from 'features/termsOfService/jwt'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import Web3 from 'web3'

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
  web3Context: Web3ContextConnected,
  jwtAuthSetupToken$: (web3: Web3, account: string) => Observable<JWToken>,
  manageMultiplyVault$: (id: BigNumber) => Observable<ManageMultiplyVaultState>,
  manageVault$: (id: BigNumber) => Observable<ManageVaultState>,
  checkVaultType$: (    token: JWToken,
    id: BigNumber) => Observable<VaultType>,
  id: BigNumber,
): Observable<GeneralManageVaultState> {
  const { account } = web3Context

  const token = jwtAuthGetToken(account)

  return checkVaultType$(token as string, id).pipe(
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
