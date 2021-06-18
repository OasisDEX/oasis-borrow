import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { compareBigNumber } from 'helpers/compare'
import { applyChange, Change, Direction, toggleSort } from 'helpers/form'
import { Observable, Subject } from 'rxjs'
import { map, scan, startWith, switchMap } from 'rxjs/operators'

import { IlkWithBalance } from './ilksWithBalances'

export type IlkSortBy =
  | 'ilkDebtAvailable'
  | 'stabilityFee'
  | 'liquidationRatio'
  | 'balance'
  | undefined

export interface IlksFilterState {
  sortBy: IlkSortBy
  direction: Direction
  search: string
  tagFilter: CoinTag | undefined
  change: (ch: Changes) => void
}

type Changes =
  | Change<IlksFilterState, 'sortBy'>
  | Change<IlksFilterState, 'search'>
  | Change<IlksFilterState, 'tagFilter'>

function applyFilter(state: IlksFilterState, change: Changes): IlksFilterState {
  switch (change.kind) {
    case 'sortBy':
      const [sortBy, direction] = toggleSort(state.sortBy, state.direction, change.sortBy)
      return {
        ...state,
        sortBy,
        direction,
      }
    default:
      return applyChange<IlksFilterState, Changes>(state, change)
  }
}

export function sortIlks(
  ilks: IlkWithBalance[],
  sortBy: IlkSortBy,
  direction: Direction,
): IlkWithBalance[] {
  const filter = `${sortBy}_${direction}`
  switch (filter) {
    case 'ilkDebtAvailable_ASC':
      return ilks.sort((a, b) => compareBigNumber(a.ilkDebtAvailable, b.ilkDebtAvailable))
    case 'ilkDebtAvailable_DESC':
      return ilks.sort((a, b) => compareBigNumber(b.ilkDebtAvailable, a.ilkDebtAvailable))
    case 'stabilityFee_ASC':
      return ilks.sort((a, b) => compareBigNumber(a.stabilityFee, b.stabilityFee))
    case 'stabilityFee_DESC':
      return ilks.sort((a, b) => compareBigNumber(b.stabilityFee, a.stabilityFee))
    case 'liquidationRatio_ASC':
      return ilks.sort((a, b) => compareBigNumber(a.liquidationRatio, b.liquidationRatio))
    case 'liquidationRatio_DESC':
      return ilks.sort((a, b) => compareBigNumber(b.liquidationRatio, a.liquidationRatio))
    case 'balance_ASC':
      return ilks.sort((a, b) => compareBigNumber(a.balance, b.balance))
    case 'balance_DESC':
      return ilks.sort((a, b) => compareBigNumber(b.balance, a.balance))
    default:
      return ilks.sort((a, b) => compareBigNumber(b.ilkDebt, a.ilkDebt))
  }
}
function filterByTag(ilks: IlkWithBalance[], tag: CoinTag | undefined) {
  if (tag === undefined) {
    return ilks
  }
  return ilks.filter((ilk) => {
    const tokenMeta = getToken(ilk.token)

    return (tokenMeta.tags as CoinTag[]).includes(tag)
  })
}

export function search(ilks: IlkWithBalance[], search: string) {
  return ilks.filter((ilk) => {
    const tokenMeta = getToken(ilk.token)

    return (
      ilk.token.toLowerCase().includes(search.toLowerCase()) ||
      tokenMeta.name.toLowerCase().includes(search.toLowerCase()) ||
      ilk.ilk.toLowerCase().includes(search.toLowerCase())
    )
  })
}

export interface IlksWithFilters {
  data: IlkWithBalance[]
  filters: IlksFilterState
}

export function ilksWithFilter$(ilks$: Observable<IlkWithBalance[]>): Observable<IlksWithFilters> {
  const change$ = new Subject<Changes>()
  function change(ch: Changes) {
    change$.next(ch)
  }

  const initialState: IlksFilterState = {
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
      ilks$.pipe(
        map((ilks) => sortIlks(ilks, filters.sortBy, filters.direction)),
        map((ilks) => filterByTag(ilks, filters.tagFilter)),
        map((ilks) => search(ilks, filters.search)),
        map((ilks) => ({ filters, data: ilks })),
      ),
    ),
  )
}
