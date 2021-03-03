import { IlkData, IlkDataList, IlkWithBalance } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { startWithDefault } from 'helpers/operators'
import { isEqual } from 'lodash'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged } from 'rxjs/operators'

import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { vaultsWithFilter$, VaultsWithFilters } from './vaultsFilters'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface FeaturedIlk extends IlkData {
  title: string
}

export interface VaultsOverview {
  vaults: VaultsWithFilters
  vaultSummary: VaultSummary | undefined
  ilks: IlksWithFilters
  featuredIlks: FeaturedIlk[] | undefined
}

function createFeaturedIlk(
  ilkDataList: IlkDataList,
  selector: (ilks: IlkDataList) => IlkData | undefined,
  title: string,
): FeaturedIlk | undefined {
  const featured = selector(ilkDataList.filter(hasAllMetaInfo))
  if (featured === undefined) {
    return undefined
  }

  return {
    ...featured,
    title,
  }
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
  return ilkDataList$.pipe(
    map((ilks) =>
      [
        createFeaturedIlk(ilks, getNewest, 'New'),
        createFeaturedIlk(ilks, getMostPopular, 'Most Popular'),
        createFeaturedIlk(ilks, getCheapest, 'Cheapest'),
      ].filter((featured): featured is FeaturedIlk => featured !== undefined),
    ),
  )
}

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<Vault[]>,
  ilkDataList$: Observable<IlkWithBalance[]>,
  featuredIlks$: Observable<FeaturedIlk[]>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    vaultsWithFilter$(vaults$(address)),
    vaults$(address).pipe(map(getVaultsSummary)),
    ilksWithFilter$(ilkDataList$),
    startWithDefault(featuredIlks$, undefined),
  ).pipe(
    map(([vaults, vaultSummary, ilks, featuredIlks]) => ({
      vaults,
      vaultSummary,
      ilks,
      featuredIlks,
    })),
    distinctUntilChanged(isEqual),
  )
}
