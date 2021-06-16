import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { compareBigNumber } from 'helpers/compare'
import { applyChange, Change, Direction, toggleSort } from 'helpers/form'
import { Observable, Subject } from 'rxjs'
import { map, scan, startWith, switchMap } from 'rxjs/operators'
import { search, sortIlks } from './ilksFilters'

import { IlkWithBalance } from './ilksWithBalances'

export type IlkSortBy =
  | 'ilkDebtAvailable'
  | 'stabilityFee'
  | 'liquidationRatio'
  | 'balance'
  | undefined

export type TagFilter = CoinTag | 'popular' | undefined

export interface IlksFilterState {
  sortBy: IlkSortBy
  direction: Direction
  search: string
  tagFilter: TagFilter
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
function filterByTag(ilks: IlkWithBalance[], tag: TagFilter) {
  if (tag === undefined) {
    return ilks
  }

  if (tag === 'popular') {
    return ilks
  }
  return ilks.filter((ilk) => {
    const tokenMeta = getToken(ilk.token)

    return (tokenMeta.tags as CoinTag[]).includes(tag)
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
    tagFilter: 'popular',
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
