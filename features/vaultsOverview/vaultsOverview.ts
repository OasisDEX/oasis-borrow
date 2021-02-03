import { IlkDataList, IlkDataSummary } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultSummary } from 'features/vault/vaultSummary'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { filter, startWith } from 'rxjs/operators'

interface FeaturedIlk extends IlkDataSummary {
  title: string
}

export interface VaultsOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
  featuredIlks: FeaturedIlk | undefined
}

export function createFeaturedIlk(
  ilkDataList$: Observable<IlkDataList>,
  title: string,
  selector: (ilk: IlkDataList) => IlkDataSummary | undefined
): Observable<IlkDataSummary> {
  return ilkDataList$.pipe(
    map(selector),
    filter((ilk): ilk is IlkDataSummary => ilk !== undefined),
    map(ilk => ({...ilk, title}))
  )
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
    map(([vaults, vaultSummary, ilkDataList, featuredIlks]) => ({
      vaults,
      vaultSummary,
      ilkDataList,
      featuredIlks,
    })),
  )
}
