import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { compareBigNumber } from 'helpers/compare'
import { applyChange, Change, Direction, toggleSort } from 'helpers/form'
import { zero } from 'helpers/zero'
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
      .filter((ilk) => ilk.ilkDebtAvailable.gt(zero))
      .sort((ilk1, ilk2) => compareBigNumber(ilk2.ilkDebt, ilk1.ilkDebt))
      .slice(0, 12)
  }
  return ilks.filter((ilk) => {
    const tokenMeta = getToken(ilk.token)

    return (tokenMeta.tags as CoinTag[]).includes(tag)
  })
}

export interface PopularIlksWithFilters {
  data: IlkWithBalance[]
  filters: IlksFilterState
}

export function popularIlksWithFilter$(
  ilks$: Observable<IlkWithBalance[]>,
): Observable<PopularIlksWithFilters> {
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
        map((ilks) => filterByTag(ilks, filters.tagFilter)),
        map((ilks) => sortIlks(ilks, filters.sortBy, filters.direction)),
        map((ilks) => search(ilks, filters.search)),
        map((ilks) => ({ filters, data: ilks })),
      ),
    ),
  )
}
