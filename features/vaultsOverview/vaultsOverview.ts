import { VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged } from 'rxjs/operators'

import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { vaultsWithFilter$, VaultsWithFilters } from './vaultsFilters'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface VaultsOverview {
  vaults: {
    borrow: VaultsWithFilters
    multiply: VaultsWithFilters
  }
  vaultSummary: VaultSummary | undefined
  ilksWithFilters: IlksWithFilters
}

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<VaultWithType[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  address: string,
): Observable<VaultsOverview> {
  const vaultsAddress$ = vaults$(address)

  return combineLatest(
    vaultsWithFilter$(
      vaults$(address).pipe(map((vaults) => vaults.filter((vault) => vault.type === 'borrow'))),
    ),
    vaultsWithFilter$(
      vaults$(address).pipe(map((vaults) => vaults.filter((vault) => vault.type === 'multiply'))),
    ),
    vaultsAddress$.pipe(map(getVaultsSummary)),
    ilksWithFilter$(ilksListWithBalances$),
  ).pipe(
    map(([borrow, multiply, vaultSummary, ilksWithFilters]) => ({
      vaults: {
        borrow,
        multiply,
      },
      vaultSummary,
      ilksWithFilters,
    })),
    distinctUntilChanged(isEqual),
  )
}
