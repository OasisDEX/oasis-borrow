import BigNumber from 'bignumber.js'
import { IlkData, IlkDataList } from 'blockchain/ilks'
import { Context } from 'blockchain/network'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { getVaultsSummary, VaultSummary } from 'features/vault/vaultSummary'
import { ApplyChange, applyChange, Change } from 'helpers/form'
import { isEqual } from 'lodash'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, scan, startWith, switchMap } from 'rxjs/operators'

export interface FeaturedIlk extends IlkData {
  title: string
}

export interface IlkDataWithBalance extends IlkData {
  balance: BigNumber | undefined
  balancePrice: BigNumber | undefined
}

export interface VaultsOverview {
  canOpenVault: boolean
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataWithBalance[] | undefined
  featuredIlks: FeaturedIlk[] | undefined
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
    ].filter((featured): featured is FeaturedIlk => featured !== undefined)),
  )
}

type VaultsFilter<T extends keyof Vault> = `${T}_ASC` | `${T}_DESC`
type VaultSortBy = VaultsFilter<'collateral' | 'debt' | 'liquidationPrice' | 'collateralizationRatio'> | undefined

interface VaultsFilterState {
  sortBy: VaultSortBy
  change: (ch: Changes) => void
}

type Changes = Change<VaultsFilterState, 'sortBy'>

function compareBigNumber(a: BigNumber | undefined, b: BigNumber | undefined) {
  if (a === undefined && b === undefined) {
    return 0
  }
  if (a === undefined) {
    return -1
  }
  if (b === undefined) {
    return 1
  }

  return a.comparedTo(b)
}

function sortVaults(vaults: Vault[], sortBy: VaultSortBy): Vault[] {
  switch (sortBy) {
    case 'collateral_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.collateral, v2.collateral))
    case 'collateral_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.collateral, v1.collateral))
    case 'collateralizationRatio_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.collateralizationRatio, v2.collateralizationRatio))
    case 'collateralizationRatio_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.collateralizationRatio, v1.collateralizationRatio))
    case 'debt_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.debt, v2.debt))
    case 'debt_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.debt, v1.debt))
    case 'liquidationPrice_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.liquidationPrice, v2.liquidationPrice))
    case 'liquidationPrice_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.liquidationPrice, v1.liquidationPrice))
    default:
      return vaults.sort((v1, v2) => v1.availableIlkDebt.comparedTo(v2.availableIlkDebt))
  }
}

function startWithDefault<T, K>(o$: Observable<T>, defaultValue: K): Observable<T | K> {
  return o$.pipe(
    startWith<T | K>(defaultValue)
  )
}

function vaultsFilter$(vaults$: Observable<Vault[]>) {
  const change$ = new Subject<Changes>()

  const apply: ApplyChange<VaultsFilterState> = applyChange
  function change(ch: Changes) {
    change$.next(ch)
  }

  const initialState: VaultsFilterState = {
    sortBy: undefined,
    change
  }

  return change$.pipe(
    scan(apply, initialState),
    startWith(initialState),
    switchMap(filters => vaults$.pipe(
      map(vaults => sortVaults(vaults, filters.sortBy)),
      map(vaults => ({ filters, vaults }))
    ))
  )
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

  return combineLatest(
    context$,
    vaultsFilter$(vaults$(address)),
    vaults$(address).pipe(
      map(getVaultsSummary)
    ),
    startWithDefault(ilkDataList$, undefined),
    startWithDefault(featuredIlks$, undefined),
    startWithDefault(balances$(address), {} as Record<string, { price: BigNumber; balance: BigNumber }>),
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
    distinctUntilChanged(isEqual),
  )
}
