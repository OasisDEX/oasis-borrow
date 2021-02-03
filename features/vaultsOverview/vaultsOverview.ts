import { IlkDataList, IlkDataSummary } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultSummary } from 'features/vault/vaultSummary'
import minBy from 'lodash/minBy'
import maxBy from 'lodash/maxBy'
import { forkJoin, Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { filter, startWith, tap } from 'rxjs/operators'
import { getToken } from 'blockchain/tokensMetadata'

export interface FeaturedIlk extends IlkDataSummary {
  title: string
}

export interface VaultsOverview {
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
  featuredIlks: FeaturedIlk[] | undefined
}

export function createFeaturedIlk$(
  ilkDataList$: Observable<IlkDataList>,
  selector: (ilks: IlkDataList) => IlkDataSummary | undefined,
  title: string,
): Observable<FeaturedIlk> {
  return ilkDataList$.pipe(
    map(ilks => ilks.filter(hasAllMetaInfo)),
    tap(console.log),
    map(selector),
    filter((ilk): ilk is IlkDataSummary => ilk !== undefined),
    map(ilk => ({...ilk, title}))
  )
}

function hasAllMetaInfo(ilk: IlkDataSummary) {
  const token = getToken(ilk.token);

  return 'icon' in token 
    &&   'background' in token
}

export function getNewest(ilks: IlkDataList) {
  return maxBy(ilks, ilk => Number(ilk.ilk))
}

export function getMostPopular(ilks: IlkDataList) {
  return maxBy(ilks, ilk => ilk.debt)
}

export function getCheapest(ilks: IlkDataList) {
  return minBy(ilks, ilk => ilk.stabilityFee.toNumber())
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
    ilkDataList$.pipe(tap(i => console.log(i)), startWith<IlkDataList | undefined>(undefined)),
    forkJoin(
      createFeaturedIlk$(ilkDataList$, getNewest, 'New'),
      createFeaturedIlk$(ilkDataList$, getMostPopular, 'Most Popular'),
      createFeaturedIlk$(ilkDataList$, getCheapest, 'Cheapest'),
    ).pipe(startWith<FeaturedIlk[] | undefined>(undefined))
  ).pipe(
    map(([vaults, vaultSummary, ilkDataList, featuredIlks]) => ({
      vaults,
      vaultSummary,
      ilkDataList,
      featuredIlks,
    })),
  )
}
