import BigNumber from 'bignumber.js'
import { IlkOverview } from 'features/ilksOverview'
import { Vault } from 'features/vaults/vault'
import { VaultSummary } from 'features/vaults/vaultsSummary'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { startWith } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

export interface AccountOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilksOverview: IlkOverview[] | undefined
  balances: Dictionary<BigNumber> | undefined
}

export function createAccountOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkOverview$: Observable<IlkOverview[]>,
  balances$: (address: string) => Observable<Dictionary<BigNumber>>,
  address: string,
): Observable<AccountOverview> {
  return combineLatest(
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkOverview$.pipe(startWith<IlkOverview[] | undefined>(undefined)),
    balances$(address).pipe(startWith<Dictionary<BigNumber, string> | undefined>(undefined)),
  ).pipe(
    map(([vaults, vaultSummary, ilksOverview, balances]) => ({
      vaults,
      vaultSummary,
      ilksOverview,
      balances,
    })),
  )
}
