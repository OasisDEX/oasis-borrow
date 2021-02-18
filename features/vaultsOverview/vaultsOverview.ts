import BigNumber from 'bignumber.js'
import { IlkData, IlkDataList } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { getVaultsSummary, VaultSummary } from 'features/vault/vaultSummary'
import { isEqual, sortBy } from 'lodash'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, tap, startWith, switchMap } from 'rxjs/operators'

export interface FeaturedIlk extends IlkData {
  title: string
}

export interface IlkDataWithBalance extends IlkData {
  balance: BigNumber | undefined
  balancePrice: BigNumber | undefined
}

interface Sort {
  key: keyof IlkDataWithBalance,
  direction: 'DESC' | 'ASC'
}

export interface VaultsOverview {
  canOpenVault: boolean
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataWithBalance[] | undefined
  featuredIlks: FeaturedIlk[] | undefined
  sorting: Sort | undefined
  toggleSort(key: keyof IlkDataWithBalance): void
}

function createFeaturedIlk(
  ilkDataList: IlkDataList,
  selector: (ilks: IlkDataList) => IlkData | undefined,
  title: string): FeaturedIlk | undefined {
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
    map(ilks => [
      createFeaturedIlk(ilks, getNewest, 'New'),
      createFeaturedIlk(ilks, getMostPopular, 'Most Popular'),
      createFeaturedIlk(ilks, getCheapest, 'Cheapest'),
    ])
  )
}

function updateSort(current: Sort | undefined, key: keyof IlkDataWithBalance): Sort | undefined {
  if (current === undefined || current.key !== key) {
    return {
      key,
      direction: 'ASC',
    }
  }
  if (current.direction === 'ASC') {
    return {
      key,
      direction: 'DESC'
    }
  }
  return undefined
}

function sort({ ilkDataList, sorting, ...state }: VaultsOverview): VaultsOverview {
  return {
    ...state,
    sorting,
    ilkDataList: sorting
      ? sortBy(ilkDataList, data => data[sorting.key])
      : ilkDataList
  }
}

export function createVaultsOverview$(
  context$: Observable<Context>,
  vaults$: (address: string) => Observable<Vault[]>,
  ilkDataList$: Observable<IlkDataList>,
  featuredIlks$: Observable<FeaturedIlk[]>,
  balances$: (
    address: string,
  ) => Observable<Record<string, { price: BigNumber; balance: BigNumber }>>,
  address: string,
): Observable<VaultsOverview> {
  const sorting$ = new BehaviorSubject<Sort | undefined>(undefined)
  const toggleSort = (key: keyof IlkDataWithBalance) => sorting$.next(updateSort(sorting$.value, key))

  return combineLatest(
    context$,
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaults$(address).pipe(map(getVaultsSummary), startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
    featuredIlks$.pipe(startWith<FeaturedIlk[] | undefined>(undefined)),
    balances$(address).pipe(
      startWith<Record<string, { price: BigNumber; balance: BigNumber }>>({}),
    ),
  ).pipe(
    map(([context, vaults, vaultSummary, ilkDataList, featuredIlks, balances]) => ({
      canOpenVault: context.status === 'connected',
      vaults,
      vaultSummary,
      ilkDataList: ilkDataList
        ? ilkDataList.map((ilk) => ({
          ...ilk,
          balance: balances[ilk.token]?.balance,
          balancePrice: balances[ilk.token]?.price.times(balances[ilk.token]?.balance),
        }))
        : ilkDataList,
      featuredIlks,
    })),
    switchMap(state => combineLatest(of(state), sorting$)),
    map(([state, sorting]) => ({
      ...state,
      toggleSort,
      sorting,
    })),
    map(sort),
    distinctUntilChanged((a, b) => isEqual(a, b)),
  )
}
