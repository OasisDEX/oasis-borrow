import { Observable, of } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { Vault } from '../blockchain/vaults'
import { IlkData } from '../blockchain/ilks'

function userAlreadyHasSethCRVVault(usersVaults: Vault[], ilk: IlkData) {
  return (
    ilk.ilk === 'CRVV1ETHSTETH-A' && usersVaults.some((vault) => vault.ilk === 'CRVV1ETHSTETH-A')
  )
}

function noDebtAvailableOnIlk(ilk: IlkData) {
  return ilk.ilkDebtAvailable.lt(ilk.debtFloor)
}

export function createCanCreateVaultForIlk$(
  usersVaults$: Observable<Vault[]>,
  ilk: IlkData,
): Observable<CanOpenVaultResult> {
  return usersVaults$.pipe(
    map((usersVaults) => {
      if (userAlreadyHasSethCRVVault(usersVaults, ilk)) {
        return { canOpen: false, excuse: 'user-already-has-vault' }
      }

      if (noDebtAvailableOnIlk(ilk)) {
        return { canOpen: false, excuse: 'vault-full' }
      }

      return { canOpen: true }
    }),
  )
}

export type CanOpenVaultResult =
  | {
      canOpen: true
    }
  | {
      canOpen: false
      excuse: 'vault-full' | 'user-already-has-vault'
    }

export function mockCanCreateVaultForIlk$(): Observable<CanOpenVaultResult> {
  return of({ canOpen: true })
}
