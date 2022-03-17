import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { compareBigNumber } from 'helpers/compare'
import { ApplyChange, applyChange, Change, Direction, toggleSort } from 'helpers/form'
import { Observable, Subject } from 'rxjs'
import { map, scan, startWith, switchMap } from 'rxjs/operators'

import { StopLossTriggerData } from '../automation/common/StopLossTriggerDataExtractor'
export type VaultSortBy =
  | 'collateral'
  | 'debt'
  | 'liquidationPrice'
  | 'collateralizationRatio'
  | 'freeCollateral'
  | 'id'
  | undefined

export interface VaultsFilterState {
  sortBy: VaultSortBy
  direction: Direction
  search: string
  tagFilter: CoinTag | undefined
  change: (ch: Changes) => void
}
type Changes =
  | Change<VaultsFilterState, 'sortBy'>
  | Change<VaultsFilterState, 'search'>
  | Change<VaultsFilterState, 'tagFilter'>

function applyFilter(state: VaultsFilterState, change: Changes): VaultsFilterState {
  const apply: ApplyChange<VaultsFilterState, Changes> = applyChange

  switch (change.kind) {
    case 'sortBy':
      const [sortBy, direction] = toggleSort(state.sortBy, state.direction, change.sortBy)
      return {
        ...state,
        sortBy,
        direction,
      }

    default:
      return apply(state, change)
  }
}

function sortVaults(vaults: Vault[], sortBy: VaultSortBy, direction: Direction): Vault[] {
  const filter = `${sortBy}_${direction}`
  switch (filter) {
    case 'collateral_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.lockedCollateral, v2.lockedCollateral))
    case 'collateral_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.lockedCollateral, v1.lockedCollateral))
    case 'collateralizationRatio_ASC':
      return vaults.sort((v1, v2) =>
        compareBigNumber(v1.collateralizationRatio, v2.collateralizationRatio),
      )
    case 'collateralizationRatio_DESC':
      return vaults.sort((v1, v2) =>
        compareBigNumber(v2.collateralizationRatio, v1.collateralizationRatio),
      )
    case 'debt_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.debt, v2.debt))
    case 'debt_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.debt, v1.debt))
    case 'liquidationPrice_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.liquidationPrice, v2.liquidationPrice))
    case 'liquidationPrice_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.liquidationPrice, v1.liquidationPrice))
    case 'freeCollateral_ASC':
      return vaults.sort((v1, v2) => compareBigNumber(v1.freeCollateral, v2.freeCollateral))
    case 'freeCollateral_DESC':
      return vaults.sort((v1, v2) => compareBigNumber(v2.freeCollateral, v1.freeCollateral))
    case 'id_ASC':
      return vaults.sort((v1, v2) => Number(v1.id) - Number(v2.id))
    case 'id_DESC':
      return vaults.sort((v1, v2) => Number(v2.id) - Number(v1.id))
    default:
      return vaults.sort((v1, v2) => Number(v1.id) - Number(v2.id))
  }
}

function filterByTag(vaults: Vault[], tag: CoinTag | undefined) {
  if (tag === undefined) {
    return vaults
  }
  return vaults.filter((vault) => {
    const tokenMeta = getToken(vault.token)

    return (tokenMeta.tags as CoinTag[]).includes(tag)
  })
}

function search(vaults: Vault[], search: string) {
  return vaults.filter((vault) => {
    const tokenMeta = getToken(vault.token)

    return (
      vault.token.toLowerCase().includes(search.toLowerCase()) ||
      tokenMeta.name.toLowerCase().includes(search.toLowerCase()) ||
      vault.id.toString().includes(search)
    )
  })
}

export interface VaultsWithFilters {
  data: (Vault & StopLossTriggerData)[]
  filters: VaultsFilterState
  isLoading: boolean
}
export function vaultsWithFilter$(vaults$: Observable<Vault[]>): Observable<VaultsWithFilters> {
  const change$ = new Subject<Changes>()
  function change(ch: Changes) {
    change$.next(ch)
  }

  const initialState: VaultsFilterState = {
    sortBy: undefined,
    direction: undefined,
    search: '',
    tagFilter: undefined,
    change,
  }

  return change$.pipe(
    scan(applyFilter, initialState),
    startWith(initialState),
    switchMap((filters) =>
      vaults$.pipe(
        map((vaults) => sortVaults(vaults, filters.sortBy, filters.direction)),
        map((vaults) => filterByTag(vaults, filters.tagFilter)),
        map((vaults) => search(vaults, filters.search)),
        map((vaults) => ({ filters, data: vaults, isLoading: false })),
        startWith({ filters, data: [], isLoading: true }),
      ),
    ),
  )
}
