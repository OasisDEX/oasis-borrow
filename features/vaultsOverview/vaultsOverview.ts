import { IlkDataList } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultSummary } from 'features/vault/vaultSummary'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { startWith } from 'rxjs/operators'

export interface VaultsOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
}

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkDataList$: Observable<IlkDataList>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
  ).pipe(
    map(([vaults, vaultSummary, ilkDataList]) => ({
      vaults,
      vaultSummary,
      ilkDataList,
    })),
  )
}
