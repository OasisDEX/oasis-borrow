import { IlkOverview } from 'features/landing/ilksOverview'
import { Vault } from 'features/vaults/vault'
import { VaultSummary } from 'features/vaults/vaultsSummary'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { startWith } from 'rxjs/operators'

export interface AccountOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilksOverview: IlkOverview[] | undefined
}

export function createAccountOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkOverview$: Observable<IlkOverview[]>,
  address: string,
): Observable<AccountOverview> {
  return combineLatest(
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkOverview$.pipe(startWith<IlkOverview[] | undefined>(undefined)),
  ).pipe(
    map(([vaults, vaultSummary, ilksOverview]) => ({
      vaults,
      vaultSummary,
      ilksOverview,
    })),
  )
}
