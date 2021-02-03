import BigNumber from 'bignumber.js'
import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultSummary } from 'features/vault/vaultSummary'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { startWith } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

export interface AccountOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
  balances: Dictionary<BigNumber> | undefined
}

export function createAccountOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkDataList$: Observable<IlkDataList>,
  balances$: (address: string) => Observable<Dictionary<BigNumber>>,
  address: string,
): Observable<AccountOverview> {
  return combineLatest(
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
    balances$(address).pipe(startWith<Dictionary<BigNumber, string> | undefined>(undefined)),
  ).pipe(
    map(([vaults, vaultSummary, ilkDataList, balances]) => ({
      vaults,
      vaultSummary,
      ilkDataList,
      balances,
    })),
  )
}
