import { Vault } from 'blockchain/vaults'
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
  vaults: VaultsWithFilters
  vaultSummary: VaultSummary | undefined
  ilksWithFilters: IlksWithFilters
}

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    vaultsWithFilter$(vaults$(address)),
    vaults$(address).pipe(map(getVaultsSummary)),
    ilksWithFilter$(ilksListWithBalances$),
  ).pipe(
    map(([vaults, vaultSummary, ilksWithFilters]) => ({
      vaults,
      vaultSummary,
      ilksWithFilters,
    })),
    distinctUntilChanged(isEqual),
  )
}
