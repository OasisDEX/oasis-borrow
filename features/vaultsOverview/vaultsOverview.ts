import { IlkData, IlkDataList } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { getVaultsSummary, VaultSummary } from 'features/vault/vaultSummary'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { filter, startWith } from 'rxjs/operators'

export interface FeaturedIlk extends IlkData {
  title: string
}

export interface VaultsOverview {
  canOpenVault: boolean
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
  featuredIlks: FeaturedIlk[] | undefined
}

export function createFeaturedIlk(
  ilkDataList$: Observable<IlkDataList>,
  selector: (ilks: IlkDataList) => IlkData | undefined,
  title: string,
): Observable<FeaturedIlk> {
  return ilkDataList$.pipe(
    map((ilks) => ilks.filter(hasAllMetaInfo)),
    map(selector),
    filter((ilk): ilk is IlkData => ilk !== undefined),
    map((ilk) => ({ ...ilk, title })),
  )
}

function hasAllMetaInfo(ilk: IlkData) {
  const token = getToken(ilk.token)

  if (token.symbol !== ilk.token) {
    return false
  }

  return 'icon' in token && 'background' in token && 'color' in token
}

export function getNewest(ilks: IlkDataList) {
  return ilks[ilks.length - 1]
}

export function getMostPopular(ilks: IlkDataList) {
  return maxBy(ilks, (ilk) => ilk.ilkDebt)
}

export function getCheapest(ilks: IlkDataList) {
  return minBy(ilks, (ilk) => ilk.stabilityFee.toNumber())
}

export function createFeaturedIlks$(ilkDataList$: Observable<IlkDataList>) {
  return combineLatest(
    createFeaturedIlk(ilkDataList$, getNewest, 'New'),
    createFeaturedIlk(ilkDataList$, getMostPopular, 'Most Popular'),
    createFeaturedIlk(ilkDataList$, getCheapest, 'Cheapest'),
  )
}

export function createVaultsOverview$(
  context$: Observable<Context>,
  vaults$: (address: string) => Observable<Vault[]>,
  ilkDataList$: Observable<IlkDataList>,
  featuredIlks$: Observable<FeaturedIlk[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    context$,
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaults$(address).pipe(map(getVaultsSummary), startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
    featuredIlks$.pipe(startWith<FeaturedIlk[] | undefined>(undefined)),
  ).pipe(
    map(([context, vaults, vaultSummary, ilkDataList, featuredIlks]) => ({
      canOpenVault: context.status === 'connected',
      vaults,
      vaultSummary,
      ilkDataList,
      featuredIlks,
    })),
  )
}
